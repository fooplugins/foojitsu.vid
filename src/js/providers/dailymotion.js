(function($){

	$.vid.registerMimeType('video/daily', {
		regex: /(?:dailymotion\.com(?:\/|\/embed\/)video\/|dai\.ly\/)(.+?)(?=_|&|\/|\?|$)/i,
		init: function(video){
			video.id = video.url.href.match(this.regex)[1];
			video.embed = video.url.protocol + '//www.dailymotion.com/embed/video/' + video.id + '?wmode=opaque&info=0&logo=0&related=0' + (video.options.autoPlay ? '&autoplay=1' : '');
			video.api = 'https://www.dailymotion.com/services/oembed?url=https://dai.ly/' + video.id;
		},
		parse: function(response, video){
			if (response.title && response.author_name && response.thumbnail_url){
				video.title = response.title;
				video.description = response.description;
				video.credits = response.author_name;
				video.thumbSmall = response.thumbnail_url;
				video.thumbLarge = response.thumbnail_url;
			}
		}
	});

})(FooJitsu);