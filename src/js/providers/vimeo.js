(function($){

	$.vid.registerMimeType('video/vimeo', {
		regex: /(player.)?vimeo\.com/i,
		init: function(video){
			video.id = video.url.pathname.substr(video.url.pathname.lastIndexOf('/')+1);
			video.embed = video.url.protocol + '//player.vimeo.com/video/' + video.id + '?badge=0&portrait=0' + (video.options.autoPlay ? '&autoplay=1' : '');
			video.api = 'https://vimeo.com/api/v2/video/' + video.id + '.json';
		},
		parse: function(response, video){
			if (response.length){
				video.title = response[0].title;
				video.description = response[0].description;
				video.credits = response[0].user_name;
				video.thumbSmall = response[0].thumbnail_small;
				video.thumbLarge = response[0].thumbnail_large;
			}
		}
	});

})(FooJitsu);