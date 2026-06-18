
(function () {
    window.initMoviePlayer = function (source) {
        var video = document.getElementById("movie-video");
        var button = document.getElementById("movie-play");
        var started = false;
        var hls = null;

        if (!video || !button || !source) {
            return;
        }

        function load() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            load();
            button.hidden = true;
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    button.hidden = false;
                });
            }
        }

        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!started) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (!started) {
                load();
            }
            button.hidden = true;
        });
        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };
})();
