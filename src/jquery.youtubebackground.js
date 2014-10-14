/*
 * YoutubeBackground - A wrapper for the Youtube API - Great for fullscreen background videos or just regular videos.
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 *
 * Version:  1.0.1
 *
 */

// Chain of Responsibility pattern. Creates base class that can be overridden. 
if (typeof Object.create !== "function") {
    Object.create = function(obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

(function($, window, document) {
    var
    loadAPI = function loadAPI(callback) {
        var tag = document.createElement('script'),
            head = document.getElementsByTagName('head')[0];

        tag.src = location.protocol + '//www.youtube.com/iframe_api';

        head.appendChild(tag);
        head = null;
        tag = null;

        iframeIsReady(callback);
    },
    iframeIsReady = function iframeIsReady(callback) {
        // Listen for Gobal YT player callback
        if (typeof YT === 'undefined') {
            window.onYouTubeIframeAPIReady = function() {
                window.onYouTubeIframeAPIReady = null;
                callback();
            };
        } else {
            callback();
        }
    };

    // YTPlayer Object
    YTPlayer = {
        player: null,

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
            var self = this;

            self.userOptions = userOptions;

            self.$body = $('body');
            self.$node = $(node);

            self.options = $.extend({}, self.defaults, self.userOptions);

            self.ID = (new Date()).getTime();
            self.holderID = 'YTPlayer-ID-' + self.ID;

            if (self.options.fitToBackground) {
                self.createBackgroundVideo();
            } else {
                self.createContainerVideo();
            }

            // Listen for Resize Event
            $(window).on('resize.YTplayer' + self.ID, function() {
                self.resize(self);
            });

            loadAPI(self.onYouTubeIframeAPIReady.bind(self));

            self.resize(self);

            return self;
        },

        /**
         * @function createContainerVideo
         * Adds HTML for video in a container
         */
        createContainerVideo: function createContainerVideo() {
            var self = this;

            /*jshint multistr: true */
            var $YTPlayerString = $('<div id="ytplayer-container' + self.ID + '" >\
                                    <div id="' + self.holderID + '" class="ytplayer-player"></div> \
                                    </div> \
                                    <div id="ytplayer-shield"></div>');

            self.$node.append($YTPlayerString);
            self.$YTPlayerString = $YTPlayerString;
            $YTPlayerString = null;
        },

        /**
         * @function createBackgroundVideo
         * Adds HTML for video background
         */
        createBackgroundVideo: function createBackgroundVideo() {
            /*jshint multistr: true */
            var self = this,
                $YTPlayerString = $('<div id="ytplayer-container' + self.ID + '" class="ytplayer-container background">\
                                    <div id="' + self.holderID + '" class="ytplayer-player"></div>\
                                    </div>\
                                    <div id="ytplayer-shield"></div>');

            self.$node.append($YTPlayerString);
            self.$YTPlayerString = $YTPlayerString;
            $YTPlayerString = null;
        },

        /**
         * @function resize
         * Resize event to change video size
         */
        resize: function resize(self) {
            //var self = this;
            var container = $(window);

            if (!self.options.fitToBackground) {
                container = self.$node;
            }

            var width = container.width(),
                pWidth, // player width, to be defined
                height = container.height(),
                pHeight, // player height, tbd
                $YTPlayerPlayer = $('#' + self.holderID);

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

            $YTPlayerPlayer = null;
            container = null;
        },

        /**
         * @function onYouTubeIframeAPIReady
         * @ params {object} YTPlayer object for access to options
         * Youtube API calls this function when the player is ready.
         */
        onYouTubeIframeAPIReady: function onYouTubeIframeAPIReady() {
            var self = this;
            self.player = new window.YT.Player(self.holderID, {
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
                    autohide: 0,
                    origin: location.origin,
                },
                events: {
                    'onReady': function(e) {
                        self.onPlayerReady(e);
                    },
                    'onStateChange': function(e) {
                        if(e.data === 1) {
                            self.$node.addClass('loaded')
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
            var self = this;
            if (state.data === 0 && self.options.repeat) { // video ended and repeat option is set true
                self.player.seekTo(self.options.start);
            }
        },

        /**
         * @function getPlayer
         * returns youtube player
         */
        getPlayer: function getPlayer() {
            return this.player;
        },

        /**
         * @function destroy
         * destroys all!
         */
        destroy: function destroy() {
            console.log(this);
            var self = this;

            self.$node
                .removeData('yt-init')
                .removeData('ytPlayer')
                .removeClass('loaded');

            self.$YTPlayerString.remove();

            $(window).off('resize.YTplayer' + self.ID);
            self.$body = null;
            self.$node = null;
            self.$YTPlayerString = null;
            self.player.destroy();
            self.player = null;
        }
    };

    // create plugin
    $.fn.YTPlayer = function(options) {
        return this.each(function() {
            var el = this;

            $(el).data("yt-init", true);
            var player = Object.create(YTPlayer);
            player.init(el, options);
            $.data(el, "ytPlayer", player);
        });
    };

})(jQuery, window, document);
