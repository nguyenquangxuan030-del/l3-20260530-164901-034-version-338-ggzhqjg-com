import { H as Hls } from "./hls-vendor-dru42stk.js";

function setupPlayer(shell) {
  var video = shell.querySelector("video");
  var button = shell.querySelector("[data-player-start]");
  var url = shell.getAttribute("data-video-url");
  var prepared = false;
  var hlsInstance = null;

  function prepare() {
    if (prepared || !video || !url) {
      return;
    }
    prepared = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        } else {
          hlsInstance.destroy();
        }
      });
    }
  }

  function start() {
    prepare();
    if (!video) {
      return;
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  }

  shell.addEventListener("click", function (event) {
    if (event.target === video) {
      return;
    }
    start();
  });

  if (video) {
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      shell.classList.remove("is-playing");
    });
  }

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  Array.prototype.slice
    .call(document.querySelectorAll("[data-video-url]"))
    .forEach(setupPlayer);
});
