(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-index]'));
    var prev = slider.querySelector('[data-slide-prev]');
    var next = slider.querySelector('[data-slide-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var input = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (!input || cards.length === 0) {
      return;
    }
    input.addEventListener('input', function () {
      var query = normalize(input.value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search') || card.textContent);
        card.hidden = query.length > 0 && text.indexOf(query) === -1;
      });
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
      '<span class="poster-wrap">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
      '</span>',
      '<span class="movie-info">',
      '<strong>' + escapeHtml(movie.title) + '</strong>',
      '<em>' + escapeHtml(movie.one_line) + '</em>',
      '<span class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>',
      '<span class="tag-row">' + tags + '</span>',
      '</span>',
      '</a>'
    ].join('');
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get('q') || '');
    var input = document.querySelector('.search-panel input[name="q"]');
    var summary = document.querySelector('[data-search-summary]');
    if (input) {
      input.value = params.get('q') || '';
    }
    var data = window.MOVIE_SEARCH_INDEX;
    var matches = query ? data.filter(function (movie) {
      return normalize([movie.title, movie.region, movie.genre, movie.type, (movie.tags || []).join(' '), movie.one_line].join(' ')).indexOf(query) !== -1;
    }) : data.slice(0, 36);
    if (summary) {
      summary.textContent = query ? '搜索结果' : '热门影片';
    }
    if (matches.length === 0) {
      results.innerHTML = '<div class="empty-state">没有找到匹配的影片，请尝试其他关键词。</div>';
      return;
    }
    results.innerHTML = matches.slice(0, 160).map(cardTemplate).join('');
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
