(function () {
  function setupPlayer() {
    var frame = document.querySelector('[data-video-frame]');
    if (!frame) {
      return;
    }
    var video = frame.querySelector('video');
    var button = frame.querySelector('.play-overlay');
    var source = frame.getAttribute('data-src');
    var initialized = false;
    var hls = null;

    function loadSource() {
      if (initialized || !video || !source) {
        return;
      }
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function beginPlay() {
      loadSource();
      frame.classList.add('is-playing');
      if (button) {
        button.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          frame.classList.remove('is-playing');
          if (button) {
            button.classList.remove('hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', beginPlay);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        beginPlay();
      }
    });
    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
      if (button) {
        button.classList.add('hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (!video.ended && button) {
        button.classList.remove('hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  if (document.readyState !== 'loading') {
    setupPlayer();
  } else {
    document.addEventListener('DOMContentLoaded', setupPlayer);
  }
})();
