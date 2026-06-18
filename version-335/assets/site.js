(function () {
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      const input = form.querySelector("input[name='q']");
      const value = input ? input.value.trim() : "";
      if (!value) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
        return;
      }
      event.preventDefault();
      window.location.href = "search.html?q=" + encodeURIComponent(value);
    });
  });

  const slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    const prev = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    let active = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        schedule();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.heroDot || 0));
        schedule();
      });
    });

    show(0);
    schedule();
  }

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    const container = panel.closest("section") || document;
    const keywordInput = panel.querySelector("[data-filter-keyword]");
    const yearSelect = panel.querySelector("[data-filter-year]");
    const typeSelect = panel.querySelector("[data-filter-type]");
    const count = panel.querySelector("[data-filter-count]");
    const cards = Array.from(container.querySelectorAll("[data-movie-card]"));

    function applyFilter() {
      const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
      const year = yearSelect ? yearSelect.value : "";
      const type = typeSelect ? typeSelect.value : "";
      let visible = 0;

      cards.forEach(function (card) {
        const text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre
        ].join(" ").toLowerCase();
        const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchYear = !year || card.dataset.year === year;
        const matchType = !type || card.dataset.type === type;
        const show = matchKeyword && matchYear && matchType;
        card.classList.toggle("is-filtered-out", !show);
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + " 部影片";
      }
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  });
})();
