# jQuery.BackgroundVideo V 1.0
Inspired by [Tubular] (http://www.seanmccambridge.com/tubular/)

Example: http://rochestb.github.io/jQuery.YoutubeBackground

[jQuery](http://jquery.com/) plugin that lets you create background videos using youtube api


Put the script at the [bottom](https://developer.yahoo.com/performance/rules.html#js_bottom) of your markup right after jQuery:

```html
 <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
 <script src="src/jquery.youtubebackground.js"></script>
```

```html
<div id="video"></div>
```

Call the [plugin](http://learn.jquery.com/plugins/) function and your carousel is ready.

```javascript
$('#video').YTPlayer({
    fitToBackground: true,
    videoId: 'LSmgKRx5pBo'
});
```

## Works with Youtube Javascript API

[Youtube Javascript API Options](https://developers.google.com/youtube/js_api_reference)

Access all of YouTube's API by using player:
```

var player = $('#background-video').data('ytPlayer').player;
player.pauseVideo();
player.playVideo();

player.addEventListener('onStateChange', function(data){
  console.log("Player State Change", data);
});

```

## Options
For more details visit our [Documentations Page] (http://rochestb.github.io/jQuery.YoutubeBackground)


## Install with Bower

```
bower install youtube-background-video
```
## Documentation

[Documentations Page] (http://rochestb.github.io/jQuery.YoutubeBackground)

## Contributing

I welcome contributors, bugs, and questions.

### Bug reports

A bug is a **demonstrable problem** that is caused by the code in the repository. Good bug reports are extremely helpful, so thanks!

Guidelines for bug reports:

  1. Use the GitHub issue search — check if the issue has already been reported.

  2. Check if the issue has been fixed — try to reproduce it using the latest `develop` branch in the repository.

  3. Isolate the problem — ideally create a reduced test case and a live example. This [JSFiddle](http://jsfiddle.net/u3FTZ/) is a helpful template you can fork.


**By submitting a patch, you agree to allow the project owner to
license your work under the terms of the [MIT License](LICENSE).**

## License

The code and the documentation are released under the [MIT License](LICENSE).
