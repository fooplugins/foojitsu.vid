#FooJitsu.vid v1.0.0

A plugin to retrieve additional video information from supported API's.

##Usage

At the moment we are making use of the awesome free service [rawgit.com](https://rawgit.com/) as it's just so easy! To include the latest version of FooJitsu.vid 
please use the following:

```html
<script src="//cdn.rawgit.com/fooplugins/foojitsu.vid/1.0.0/foojitsu.vid.min.js"></script>
```

Or grab the compiled files from the repo's root directory and include them in your project. Once included you can use FooJitsu.vid as seen below:

```javascript
FooJitsu.vid('any-supported-url').then(function(video){
    // Do what you like with the video object. See below for more information.
}, function(err, video){
    // If any errors occur they can be handled here. An error will be thrown for unsupported urls.
});
```

####video object

In the above example you can see an argument called **video** is passed to both the success and fail callbacks. The more useful properties of this object are:

* video.url - The video url supplied to the constructor.
* video.embed - The embed url to use for the video.
* video.custom - Whether or not the video is a custom url.
* video.supported - Whether or not the video can be played in the current browser.
* video.fetchable - Whether or not additional information can be retrieved.
* video.fetched - Whether or not additional information has been retrieved.

The below are the "additional information" properties that are only set once a successful call to supported API has been made.

* video.credits - If successful the video credits, otherwise empty.
* video.title - If successful the video title, otherwise empty.
* video.description - If successful the video description, otherwise empty.
* video.thumbLarge - If successful the url to the large thumb image, otherwise empty.
* video.thumbSmall - If successful the url to the small thumb image, otherwise empty.

##Supported Urls

The below are the supported provider urls for the plugin.

###YouTube

* http[s]://www.youtube.com/watch?v=VIDEO_ID
* http[s]://youtu.be/VIDEO_ID
* http[s]://www.youtube.com/embed/VIDEO_ID

**Note**

YouTube requires authorization credentials to use it's data API. You must [obtain your own API key](https://developers.google.com/youtube/v3/getting-started) and supply it using the **youTubeKey** option.
You can also set this globally per page by using the **$.vid.config()** function like below:

```javascript
$.vid.config({youTubeKey: 'abc123...'}); // set it once globally per page
$.vid('youtube-url', {youTubeKey: 'abc123...'}); // set it for just this request
```

###Vimeo

* http[s]://vimeo.com/VIDEO_ID
* http[s]://vimeo.com/channels/CHANNEL/VIDEO_ID
* http[s]://vimeo.com/album/ALBUM/video/VIDEO_ID
* http[s]://player.vimeo.com/video/VIDEO_ID

###Wistia

* http[s]://*.wistia.com/medias/VIDEO_ID
* http[s]://*.wistia.net/embed/iframe/VIDEO_ID

**Notes**

* As per the [Wistia documentation](http://wistia.com/doc/working-with-images#the_parameters), if the image size requested for a video is not available the server will respond with a 202 Accepted header and queue up the image to be created. This should only ever happen once as the next time it is requested it should exist.
* As per the [Wistia documentation](http://wistia.com/doc/oembed#an_example) a videos author/credits are not returned along with the rest of the details when using its API. At present the **provider_name** field is used which by default is **Wistia, Inc.**.
* Wistia does not return a description for videos, this property will always be an empty string.

###Dailymotion

* http[s]://dai.ly/VIDEO_ID
* http[s]://*.dailymotion.com/video/VIDEO_ID_*
* http[s]://*.dailymotion.com/embed/video/VIDEO_ID

**Note**

The [Dailymotion API](https://developer.dailymotion.com/player#player-oembed) response only contains a single image to use as a thumbnail so videos may display a low quality image for the large thumbnail.

##Build

There are four Grunt tasks associated with the build process; **build**, **test**, **readme** and **release**.

####grunt OR grunt build

This is the default task and compiles all **/src/js/** files and outputs the results into the **/compiled/** directory.

####grunt test

This runs the **build** task and if successful then compiles all tests found in **/src/test/** directory and outputs two html files for each test 
into the **/compiled/tests/** directory, one using the concatenated version of the library and the other using the minified. The task then executes 
all tests found in the **/compiled/tests/** directory using QUnit and PhantomJS. 

####grunt readme

This task process the **README.md** in the **/src/** directory and overwrites the one located in the root directory.

####grunt release

This first checks if a release with the current **pkg.version** exists in the root directory. If it does exist the task will fail and warn you to 
update the version number in the **package.json** file. If no release exists it then runs the **test** task. If all tests pass, the **readme** task is
executed and the *foojitsu.vid.js* and *foojitsu.vid.min.js* files from the output of the **build** task are copied to the root directory. Once copied the 
following git tasks are executed:

1. gitadd - Stages all files with changes. This adds, modifies, and removes index entries to match the working tree.
2. gitcommit - Commits all staged changes to the local repo using the title "New Release X.X.X".
3. gittag - Tags the commit with the version number.

Once the task is successfully completed you will just need to push the changes to the repo.