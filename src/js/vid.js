(function($){

	/**
	 * Fetches additional information for supported video providers.
	 * @param {(string|FooJitsu.Video)} url - The url of the video to retrieve or the video object itself.
	 * @param {VidOptions} options
	 * @returns {*}
	 */
	$.vid = function(url, options){
		return (url instanceof $.Video ? url : new $.Video(url, options)).fetch();
	};

	/**
	 * The default properties for the vid plugin.
	 * @typedef {object} VidOptions
	 * @property {boolean} autoPlay - If true the video embed url's will contain the appropriate parameter to enable auto
	 * 	play. NOTE: Some mobile devices (looking at you iOS) disable videos auto playing regardless of the options set.
	 * @property {object} mimeTypes - An object containing all supported mime types. Providers will register there own mime type.
	 * @property {object} mimeTypeGroup - An object specifying mime type groups used by the plugin.
	 * @property {string} youTubeKey - The YouTube API key used to make requests.
	 */
	$.vid.defaults = {
		autoPlay: false,
		mimeTypes: {
			'video/mp4': /\.mp4/i,
			'video/webm': /\.webm/i,
			'video/wmv': /\.wmv/i,
			'video/ogg': /\.ogv/i
		},
		mimeTypeGroup: {
			custom: ['video/mp4','video/wmv','video/ogg','video/webm'],
			ie: ['video/mp4','video/wmv'],
			other: ['video/mp4','video/ogg','video/webm']
		}
	};

	/**
	 * A simple method for setting global defaults for the vid plugin.
	 * @param {object} options - The options to set as defaults.
	 */
	$.vid.config = function(options){
		$.extend(true, $.vid.defaults, options);
	};

	/**
	 * The advanced configuration object for a mime type.
	 * @typedef {object} MimeType
	 * @property {RegExp} regex
	 * @property {function} enabled - This is called to check if the mime type is enabled/able to execute. If for any reason
	 * 	the mime type can't/shouldn't be executed this should return false.
	 * @property {function} init - This is called just after all default initialization occurs. This allows custom providers
	 * 	to parse the video id and generate the appropriate api and embed url.
	 * @property {function} parse - This is called once a successful result is retrieved from the API. This allows custom
	 * 	providers to map API response properties to the appropriate video object ones.
	 */
	/**
	 * Register a new mime type with the plugin. Using this approach a new provider must simply register a new mime type.
	 * @param {string} mimeType - The mime type to register.
	 * @param {(RegExp|MimeType)} options - The options to register the mime type with.
	 */
	$.vid.registerMimeType = function(mimeType, options){
		if ($.is.string(mimeType) && (options instanceof RegExp || ($.is.hash(options) && options.regex instanceof RegExp))){
			$.vid.defaults.mimeTypes[mimeType] = options;
		} else {
			console.log('Failed to register mime type: ', mimeType, options);
		}
	};

	/**
	 * The video object is used to parse video urls and retrieve additional information if possible.
	 * @param {string} url - The url of the video to parse.
	 * @param {VidOptions} options - The options to use to retrieve the video.
	 * @returns {FooJitsu.Video}
	 * @constructor
	 */
	$.Video = function(url, options){
		if (!(this instanceof $.Video)) return new $.Video(url, options);
		/**
		 * The options for the video.
		 * @type {VidOptions}
		 */
		this.options = {};
		/**
		 * The parsed url of the video.
		 * @type {?FooJitsu.Url}
		 */
		this.url = null;
		/**
		 * The id for the video.
		 * @type {string}
		 */
		this.id = '';
		/**
		 * The API url to use to retrieve the video information.
		 * @type {string}
		 */
		this.api = '';
		/**
		 * The mime type for the video.
		 * @type {string}
		 */
		this.mimeType = '';
		/**
		 * Any additional options for the video's mime type.
		 * @type {?MimeType}
		 */
		this.mimeTypeOptions = null;
		/**
		 * Whether or not the video is custom/self hosted. Makes use of the mimeTypeGroup.custom option.
		 * @type {boolean}
		 */
		this.custom = false;
		/**
		 * Whether or not the browser can play the video.
		 * @type {boolean}
		 */
		this.supported = false;
		/**
		 * Whether or not additional information can be retrieved for the video.
		 * @type {boolean}
		 */
		this.fetchable = false;
		/**
		 * Whether or not additional information has already been retrieved.
		 * @type {boolean}
		 */
		this.fetched = false;
		/**
		 * The title of the video. This is only set after a successful call to video's API.
		 * @type {string}
		 */
		this.title = '';
		/**
		 * The description of the video. This is only set after a successful call to video's API.
		 * @type {string}
		 */
		this.description = '';
		/**
		 * The credits for the video. This is only set after a successful call to video's API.
		 * @type {string}
		 */
		this.credits = '';
		/**
		 * The url of the small thumb for the video. This is only set after a successful call to video's API.
		 * @type {string}
		 */
		this.thumbSmall = '';
		/**
		 * The url of the large thumb for the video. This is only set after a successful call to video's API.
		 * @type {string}
		 */
		this.thumbLarge = '';
		this.init(url, options);
	};

	/**
	 * Initializes the video object using the supplied url and options.
	 * @param {string} url - The url of the video.
	 * @param {VidOptions} options - The options to use to parse the url.
	 */
	$.Video.prototype.init = function(url, options){
		if (!$.is.string(url) || url === '') return;
		this.url = new $.Url(url);
		this.options = $.extend(true, {}, $.vid.defaults, options);
		var match = this.url.pathname.match(/.*\/(.*)$/);
		this.id = match && match.length >= 2 ? match[1] : null;
		this.parseMimeType(url);
	};

	/**
	 * Parses the mime type from the given url and sets the majority of the objects properties.
	 * @param url
	 */
	$.Video.prototype.parseMimeType = function(url){
		for (var name in this.options.mimeTypes){
			if (this.options.mimeTypes.hasOwnProperty(name)){
				var options = this.options.mimeTypes[name],
					isRegex = options instanceof RegExp,
					isObj = $.is.hash(options),
					regex = isRegex ? options : options.regex;

				// test the url and then if we have an options object and there is an enabled method check it
				if (regex instanceof RegExp && regex.test(url) && (isObj && $.is.fn(options.enabled) ? options.enabled.call(options, this) : true)){
					this.mimeType = name;
					this.mimeTypeOptions = options;
					this.custom = $.inArray(name, this.options.mimeTypeGroup.custom) !== -1;
					this.supported = $.inArray(name, $.browser.isIE ? this.options.mimeTypeGroup.ie : this.options.mimeTypeGroup.other) !== -1;
					if (isObj && $.is.fn(options.init)){
						options.init.call(options, this);
						this.supported = true;
					}
					this.fetchable = this.api !== '' && isObj && $.is.fn(options.parse);
					break;
				}
			}
		}
	};

	/**
	 * If possible this will retrieve the additional information for the video using a JSONP call to it's API. This method
	 * is asynchronous and returns a deferred object and callbacks should be assigned using .then(), .always(), etc.
	 */
	$.Video.prototype.fetch = function(){
		var self = this;
		return $.Deferred(function(d){
			if (self.fetched){
				d.resolve(self);
				return;
			}
			if (!self.fetchable){
				d.reject(Error('No additional information can be retrieved for this video.'), self);
				return;
			}
			$.ajax({url: self.api, dataType: 'jsonp'}).then(function(response){
				self.mimeTypeOptions.parse.call(self.mimeTypeOptions, response, self);
				self.fetched = true;
				d.resolve(self);
			}, function(err){
				self.fetched = true;
				d.reject(err, self);
			});
		});
	};

})(FooJitsu);