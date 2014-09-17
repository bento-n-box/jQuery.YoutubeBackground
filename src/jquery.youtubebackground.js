if (typeof Object.create !== "function") {
    Object.create = function(obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

(function($, window) {
    var player;
    // YTPlayer
    YTPlayer = {

        // Defaults
        defaults: {
            ratio: 16 / 9, // usually either 4/3 or 16/9 -- tweak as needed
            videoId: 'ZCAnLxRvNNc', // toy robot in space is a good default, no?
            mute: true,
            repeat: true,
            width: $(window).width(),
            wrapperZIndex: 99,
            playButtonClass: 'YTPlayer-play',
            pauseButtonClass: 'YTPlayer-pause',
            muteButtonClass: 'YTPlayer-mute',
            volumeUpClass: 'YTPlayer-volume-up',
            volumeDownClass: 'YTPlayer-volume-down',
            increaseVolumeBy: 10,
            start: 0,
            fitToBackground: true
        },

        /**
         * @function init
         * Intializes YTPlayer object
         */
        init: function init(node, userOptions) {
            this.userOptions = userOptions;
            $body = $('body'),
            $node = $(node);
            var self = this;
            this.options = $.extend({}, this.defaults, this.userOptions);

            if (this.options.fitToBackground) {
                this.createBackgroundVideo();
            } else {
                this.createContainerVideo();
            }

            // Throttled Resize Event
            $(window).on('resize', function() {
                self.resize(self);
            });
            self.resize(self);

            // Listen for Gobal YT player callback
            window.onYouTubeIframeAPIReady = function() {
                self.onYouTubeIframeAPIReady(self);
            };

            return this;
        },

        /**
         * @function createContainerVideo
         * Adds HTML for video in a container
         */
        createContainerVideo: function createContainerVideo() {
            var YTPlayerContainer = '<div id="YTPlayer-container" style="overflow: hidden; position: absolute; z-index: 0; top: 0; left: 0; right: 0; bottom: 0; min-width: 100%; height: 100%"><div id="YTPlayer-player" style="position: absolute"></div></div><div id="YTPlayer-shield" style="width: 100%; height: 100%; z-index: 2; position: absolute; left: 0; top: 0;"></div>';
            $node.append(YTPlayerContainer);
        },

        /**
         * @function createBackgroundVideo
         * Adds HTML for video background
         */
        createBackgroundVideo: function createBackgroundVideo() {
            // build container
            var YTPlayerContainer = '<div id="YTPlayer-container" style="overflow: hidden; position: fixed; z-index: 0; top: 0; left: 0; right: 0; bottom: 0; min-width: 100%; height: 100%"><div id="YTPlayer-player" style="position: absolute"></div></div><div id="YTPlayer-shield" style="width: 100%; height: 100%; z-index: 2; position: absolute; left: 0; top: 0;"></div>';

            // set up css prereq's, inject YTPlayer container and set up wrapper defaults
            $('html,body').css({
                'width': '100%',
                'height': '100%'
            });
            $body.prepend(YTPlayerContainer);
            $node.css({
                position: 'relative',
                'z-index': this.options.wrapperZIndex
            });

        },

        /**
         * @function resize
         * Resize event to change video size
         */
        resize: function resize(self) {
            //var self = this;
            var container = $(window);

            if (!self.options.fitToBackground) {
                container = $node;
            }

            var width = container.width(),
                pWidth, // player width, to be defined
                height = container.height(),
                pHeight, // player height, tbd
                $YTPlayerPlayer = $('#YTPlayer-player');

            self.options.width = width;
            // when screen aspect ratio differs from video, video must center and underlay one dimension
            if (width / self.options.ratio < height) {
                pWidth = Math.ceil(height * self.options.ratio); // get new player width
                $YTPlayerPlayer.width(pWidth).height(height).css({
                    left: (width - pWidth) / 2,
                    top: 0
                }); // player width is greater, offset left; reset top
            } else { // new video width < window width (gap to right)
                pHeight = Math.ceil(width / self.options.ratio); // get new player height
                $YTPlayerPlayer.width(width).height(pHeight).css({
                    left: 0,
                    top: 0
                }); // player height is greater, offset top; reset left
            }
        },

        /**
         * @function onYouTubeIframeAPIReady
         * @ params {object} YTPlayer object for access to options
         * Youtube API calls this function when the player is ready.
         */
        onYouTubeIframeAPIReady: function onYouTubeIframeAPIReady(self) {
            player = new window.YT.Player('YTPlayer-player', {
                width: self.options.width,
                height: Math.ceil(self.options.width / self.options.ratio),
                videoId: self.options.videoId,
                playerVars: {
                    controls: 0,
                    showinfo: 0,
                    wmode: 'transparent',
                    modestbranding: 1,
                    branding: 0,
                    rel: 0,
                    autohide: 0
                },
                events: {
                    'onReady': function(e) {
                        self.onPlayerReady(e);
                    },
                    'onStateChange': function(e) {
                        self.onPlayerStateChange(e);
                    }
                }
            });
        },

        /**
         * @function onPlayerReady
         * @ params {event} window event from youtube player
         */
        onPlayerReady: function onPlayerReady(e) {
            if (this.options.mute) {
                e.target.mute();
            }
            e.target.playVideo();
        },

        /**
         * @function onPlayerStateChange
         * @ params {event} window event from youtube player
         * Youtube API calls this function when the player's state changes.
         */
        onPlayerStateChange: function onPlayerStateChange(state) {
            if (state.data === 0 && this.options.repeat) { // video ended and repeat option is set true
                player.seekTo(this.options.start);
            }
        },

        /**
         * @function getPlayer
         * returns youtube player
         */
        getPlayer: function getPlayer() {
            return player;
        }
    };

    // create plugin
    $.fn.YTPlayer = function(options) {
        return this.each(function() {
            $(this).data("yt-init", true);
            var player = Object.create(YTPlayer);
            player.init(this, options);
            $.data(this, "ytPlayer", player);
        });
    };

})(jQuery, window);
