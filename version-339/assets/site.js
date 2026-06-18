(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function getQueryValue(name) {
    try {
      return new URL(window.location.href).searchParams.get(name) || "";
    } catch (error) {
      return "";
    }
  }

  function setupSearchForms() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-search-form]"), function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");

        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
      });
    });
  }

  function setupCardFilter() {
    var input = document.querySelector("[data-card-search]");
    var grid = document.querySelector("[data-grid]");
    var empty = document.querySelector("[data-empty]");

    if (!input || !grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var activeFilter = "all";
    var queryFromUrl = getQueryValue("q");

    if (queryFromUrl) {
      input.value = decodeURIComponent(queryFromUrl.replace(/\+/g, " "));
    }

    function apply() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var kind = card.getAttribute("data-kind") || "";
        var passQuery = !query || text.indexOf(query) !== -1;
        var passKind = activeFilter === "all" || kind === activeFilter;
        var pass = passQuery && passKind;

        card.style.display = pass ? "" : "none";

        if (pass) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", apply);

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeFilter = chip.getAttribute("data-filter") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        apply();
      });
    });

    apply();
  }

  function setupSorting() {
    var select = document.querySelector("[data-sort]");
    var grid = document.querySelector("[data-grid]");

    if (!select || !grid) {
      return;
    }

    select.addEventListener("change", function () {
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
      var value = select.value;

      cards.sort(function (a, b) {
        if (value === "year") {
          return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
        }

        if (value === "views") {
          return Number(b.getAttribute("data-views") || 0) - Number(a.getAttribute("data-views") || 0);
        }

        return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
      });

      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    });
  }

  function setupCovers() {
    Array.prototype.forEach.call(document.querySelectorAll("img[data-cover]"), function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-hidden");
      });
    });
  }

  function setupPlayers() {
    window.__sitePlayers = window.__sitePlayers || [];

    Array.prototype.forEach.call(document.querySelectorAll("[data-player]"), function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play]");

      if (!video || !button) {
        return;
      }

      var source = video.getAttribute("data-stream") || "";
      var loaded = false;

      function load() {
        if (loaded || !source) {
          return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          window.__sitePlayers.push(hls);
          return;
        }

        video.src = source;
      }

      function play() {
        load();
        player.classList.add("is-playing");
        video.setAttribute("controls", "controls");

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0) {
          player.classList.remove("is-playing");
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupSearchForms();
    setupCardFilter();
    setupSorting();
    setupCovers();
    setupPlayers();
  });
})();
