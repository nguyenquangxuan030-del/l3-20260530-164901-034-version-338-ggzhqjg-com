(function () {
  var header = document.querySelector("[data-site-header]");
  var menuToggle = document.querySelector("[data-menu-toggle]");

  function updateHeader() {
    if (!header) {
      return;
    }

    if (window.scrollY > 18) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuToggle && header) {
    menuToggle.addEventListener("click", function () {
      header.classList.toggle("menu-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === heroIndex);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === heroIndex);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }

    clearInterval(heroTimer);
    heroTimer = setInterval(function () {
      showHero(heroIndex + 1);
    }, 5000);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      showHero(i);
      startHero();
    });
  });

  showHero(0);
  startHero();

  Array.prototype.slice.call(document.querySelectorAll("[data-search-input]")).forEach(function (input) {
    var scopeSelector = input.getAttribute("data-search-scope");
    var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    var empty = document.querySelector(input.getAttribute("data-empty-target") || "");

    if (!scope) {
      scope = document;
    }

    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        var matched = !value || text.indexOf(value) !== -1;
        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    });
  });

  var player = document.querySelector("[data-player]");

  if (player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var src = player.getAttribute("data-m3u8");
    var hlsInstance = null;

    function loadVideo() {
      if (!video || !src || video.getAttribute("data-ready") === "1") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.setAttribute("data-ready", "1");
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        video.setAttribute("data-ready", "1");
        return;
      }

      video.src = src;
      video.setAttribute("data-ready", "1");
    }

    function playVideo() {
      loadVideo();

      if (!video) {
        return;
      }

      if (button) {
        button.classList.add("is-hidden");
      }

      video.controls = true;
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("ended", function () {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
