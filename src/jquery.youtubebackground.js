if (typeof Object.create !== "function") {
    Object.create = function(obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

(function($, window) {
    // Variable for youtube player
    var player;


    // YTPlayer Object
    YTPlayer = {

        // Defaults
        defaults: {
            ratio: 16 / 9,
            videoId: 'LSmgKRx5pBo',
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
            $body = $('body');
            $node = $(node);
            var self = this;
            this.options = $.extend({}, this.defaults, this.userOptions);

            if (this.options.fitToBackground) {
                this.createBackgroundVideo();
            } else {
                this.createContainerVideo();
            }

            // Listen for Resize Event
            $(window).on('resize.YTplayer', function() {
                self.resize(self);
            });

            // Listen for Gobal YT player callback
            window.onYouTubeIframeAPIReady = function() {
                self.onYouTubeIframeAPIReady(self);
            };

            // Loading YT script after we add iframe rady
            $.getScript("https://www.youtube.com/iframe_api");

            self.resize(self);
            return this;
        },

        /**
         * @function createContainerVideo
         * Adds HTML for video in a container
         */
        createContainerVideo: function createContainerVideo() {

            /*jshint multistr: true */
            var $YTPlayerString = $('<div id="ytplayer-container" class="ytplayer-container container"> \
                                    <div id="ytplayer-player" class="ytplayer-player"></div> \
                                    </div> \
                                    <div id="ytplayer-shield"></div>');

            $node.append($YTPlayerString);
        },

        /**
         * @function createBackgroundVideo
         * Adds HTML for video background
         */
        createBackgroundVideo: function createBackgroundVideo() {
            /*jshint multistr: true */
            var $YTPlayerString = $('<div id="ytplayer-container" class="ytplayer-container background">\
                                    <div id="ytplayer-player" class="ytplayer-player"></div>\
                                    </div>\
                                    <div id="ytplayer-shield"></div>');

            $node.append($YTPlayerString);
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
                $YTPlayerPlayer = $('#ytplayer-player');

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

            player = new window.YT.Player('ytplayer-player', {
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
                        if(e.data === 1) {
                            $node.addClass('loaded')
                        }
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
        },

        /**
         * @function destroy
         * destroys all!
         */
        destroy: function destroy() {
            $(window).on('resize.YTplayer');
            player.destroy();
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
