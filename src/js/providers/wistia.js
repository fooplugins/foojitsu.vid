(function($){

	$.vid.registerMimeType('video/wistia', {
		regex: /wistia\.(?:com|net)\/(?:medias|embed\/(?:iframe|playlists))\/(.+?)(?=&|\/|\?|$)/i,
		init: function(video){
			video.id = video.url.href.match(this.regex)[1];
			var playlist = /\/playlists\//i.test(video.url.href);
			video.embed = video.url.protocol + '//fast.wistia.net/embed/'+(playlist ? 'playlists' : 'iframe')+'/'+video.id + '?theme=' + (video.options.autoPlay ? (playlist ? '&media_0_0[autoPlay]=1' : '$autoPlay=1') : '');
			video.api = 'https://fast.wistia.net/oembed.json?url=' + video.url.href;
		},
		parse: function(response, video){
			if (response.title && response.provider_name && response.thumbnail_url){
				var tmp = new $.Url(response.thumbnail_url);
				video.title = response.title;
				video.credits = response.provider_name;
				video.thumbSmall = tmp.param('image_crop_resized', '100x60').toString();
				video.thumbLarge = tmp.param('image_crop_resized', '800x480').toString();
			}
		}
	});

})(FooJitsu);