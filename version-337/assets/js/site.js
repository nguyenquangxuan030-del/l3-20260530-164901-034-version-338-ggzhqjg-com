(function () {
  function all(selector, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(selector),
    );
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initMenu() {
    var toggle = one("[data-menu-toggle]");
    var panel = one("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      toggle.classList.toggle("is-active");
    });
  }

  function initHero() {
    var hero = one("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = all("[data-hero-slide]", hero);
    var dots = all("[data-hero-dot]", hero);
    var prev = one("[data-hero-prev]", hero);
    var next = one("[data-hero-next]", hero);
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
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
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
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
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initPageFilter() {
    var input = one("[data-page-filter]");
    if (!input) {
      return;
    }
    var cards = all("[data-movie-card]");
    var empty = one("[data-filter-empty]");
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search-text") || "").toLowerCase();
        var matched = !query || text.indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    });
  }

  function createResultCard(item) {
    var tags = (item.tags || [])
      .slice(0, 3)
      .map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      })
      .join("");
    return [
      '<article class="movie-card">',
      '<a class="card-cover" href="' + item.url + '">',
      '<img src="./' +
        item.cover +
        '" alt="' +
        escapeHtml(item.title) +
        '" loading="lazy">',
      '<span class="score-badge">' + escapeHtml(item.rating) + "</span>",
      "</a>",
      '<div class="card-body">',
      '<a class="card-title" href="' +
        item.url +
        '">' +
        escapeHtml(item.title) +
        "</a>",
      "<p>" + escapeHtml(item.oneLine) + "</p>",
      '<div class="card-meta"><span>' +
        escapeHtml(item.year) +
        "</span><span>" +
        escapeHtml(item.region) +
        "</span><span>" +
        escapeHtml(item.type) +
        "</span></div>",
      '<div class="tag-row">' + tags + "</div>",
      "</div>",
      "</article>",
    ].join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
      }[char];
    });
  }

  function initSearch() {
    var data = window.MOVIE_SEARCH_DATA || [];
    var results = one("[data-search-results]");
    if (!results) {
      return;
    }
    var input = one("[data-search-input]");
    var region = one("[data-search-region]");
    var type = one("[data-search-type]");
    var year = one("[data-search-year]");
    var status = one("[data-search-status]");
    var params = new URLSearchParams(window.location.search);
    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function readText(item) {
      return [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.category,
        item.oneLine,
        (item.tags || []).join(" "),
      ]
        .join(" ")
        .toLowerCase();
    }

    function render() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      var matched = data
        .filter(function (item) {
          var text = readText(item);
          if (query && text.indexOf(query) === -1) {
            return false;
          }
          if (regionValue && item.region.indexOf(regionValue) === -1) {
            return false;
          }
          if (typeValue && item.type.indexOf(typeValue) === -1) {
            return false;
          }
          if (yearValue && item.year !== yearValue) {
            return false;
          }
          return true;
        })
        .slice(0, 80);
      results.innerHTML = matched.map(createResultCard).join("");
      if (status) {
        status.textContent = matched.length
          ? "已找到相关影片"
          : "没有找到匹配影片";
      }
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initPageFilter();
    initSearch();
  });
})();
