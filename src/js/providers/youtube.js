(function($){

	$.vid.config({
		youTubeKey: null
	});

	$.vid.registerMimeType('video/youtube', {
		regex: /(?:embed\/|youtu\.be\/|(?:\?|&)v=)(.+?)(?=&|\/|\?|$)/i,
		enabled: function(video){
			return video.options.youTubeKey !== null;
		},
		init: function(video){
			video.id = video.url.href.match(this.regex)[1];
			video.embed = video.url.protocol + '//www.youtube.com/embed/' + video.id + '?modestbranding=1&rel=0&wmode=transparent&showinfo=0' + (video.options.autoPlay ? '&autoplay=1' : '');
			video.api = 'https://www.googleapis.com/youtube/v3/videos?id=' + video.id + '&fields=items(snippet(title,description,channelTitle,thumbnails))&part=snippet&key=' + video.options.youTubeKey;
		},
		parse: function(response, video){
			if (response.items && response.items.length){
				var tmp = response.items[0].snippet;
				video.title = tmp.title;
				video.description = tmp.description;
				video.credits = tmp.channelTitle;
				video.thumbSmall = this.thumb(tmp);
				video.thumbLarge = this.thumb(tmp, true);
			}
		},
		thumb_sizes: ['default','medium','high','standard','maxres'],
		thumb: function(data, largest){
			var test = JSON.parse(JSON.stringify(this.thumb_sizes)), thumbs = data.thumbnails;
			if (largest) test.reverse();
			for (var i = 0, len = test.length; i < len; i++){
				if (thumbs.hasOwnProperty(test[i])) return thumbs[test[i]].url;
			}
			return '';
		}
	});

})(FooJitsu);