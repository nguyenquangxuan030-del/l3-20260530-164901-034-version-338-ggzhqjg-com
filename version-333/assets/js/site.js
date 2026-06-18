(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
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
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function renderSearchResults(input, panel, results) {
    panel.innerHTML = "";
    if (!results.length) {
      panel.classList.remove("is-open");
      return;
    }
    results.slice(0, 8).forEach(function (item) {
      var link = document.createElement("a");
      link.className = "search-result-item";
      link.href = item.url;

      var title = document.createElement("strong");
      title.textContent = item.title;

      var meta = document.createElement("span");
      meta.textContent = item.meta;

      var line = document.createElement("span");
      line.textContent = item.line;

      link.appendChild(title);
      link.appendChild(meta);
      link.appendChild(line);
      panel.appendChild(link);
    });
    panel.classList.add("is-open");
  }

  function setupSiteSearch() {
    var index = window.SEARCH_INDEX || [];
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
    inputs.forEach(function (input) {
      var panel = input.parentElement.querySelector("[data-search-results]");
      if (!panel) {
        return;
      }
      input.addEventListener("input", function () {
        var query = normalize(input.value);
        if (query.length < 1) {
          panel.classList.remove("is-open");
          panel.innerHTML = "";
          return;
        }
        var results = index.filter(function (item) {
          return normalize(item.title + " " + item.line + " " + item.meta).indexOf(query) !== -1;
        });
        renderSearchResults(input, panel, results);
      });
      input.addEventListener("focus", function () {
        if (panel.innerHTML) {
          panel.classList.add("is-open");
        }
      });
      document.addEventListener("click", function (event) {
        if (!input.parentElement.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function setupPageFilter() {
    var filter = document.querySelector("[data-page-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!filter && !yearFilter) {
      return;
    }

    function matchYear(text, value) {
      if (!value) {
        return true;
      }
      if (value === "classic") {
        var matched = text.match(/(19\d{2}|20\d{2})/);
        if (!matched) {
          return false;
        }
        return Number(matched[1]) <= 2020;
      }
      return text.indexOf(value) !== -1;
    }

    function apply() {
      var query = normalize(filter ? filter.value : "");
      var year = yearFilter ? yearFilter.value : "";
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search-text") + " " + card.textContent);
        var visible = (!query || text.indexOf(query) !== -1) && matchYear(text, year);
        card.style.display = visible ? "" : "none";
      });
    }

    if (filter) {
      filter.addEventListener("input", apply);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", apply);
    }
  }

  function setupPlayer() {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    if (!video) {
      return;
    }
    var address = video.getAttribute("data-hls");
    var hlsInstance = null;

    function attach() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = address;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(address);
        hlsInstance.attachMedia(video);
      } else {
        video.src = address;
      }
      video.setAttribute("data-ready", "1");
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var playback = video.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupSiteSearch();
    setupPageFilter();
    setupPlayer();
  });
})();
