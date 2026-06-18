
(function () {
    var mobileToggle = document.querySelector(".mobile-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", function () {
            var open = mobilePanel.classList.toggle("is-open");
            mobileToggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
        var active = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });

        show(0);
        if (slides.length > 1) {
            window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
    });

    document.querySelectorAll(".filter-scope").forEach(function (scope) {
        var keywordInput = scope.querySelector("[data-filter-keyword]");
        var regionSelect = scope.querySelector("[data-filter-region]");
        var yearSelect = scope.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".filter-card"));

        if (!cards.length) {
            return;
        }

        if (keywordInput && keywordInput.hasAttribute("data-url-query")) {
            var params = new URLSearchParams(window.location.search);
            var queryName = keywordInput.getAttribute("data-url-query");
            var queryValue = params.get(queryName);
            if (queryValue) {
                keywordInput.value = queryValue;
            }
        }

        function normalize(text) {
            return String(text || "").toLowerCase().trim();
        }

        function filter() {
            var keyword = normalize(keywordInput ? keywordInput.value : "");
            var region = regionSelect ? regionSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-filter-text"));
                var cardRegion = card.getAttribute("data-filter-region") || "";
                var cardYear = card.getAttribute("data-filter-year") || "";
                var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                var regionMatch = !region || cardRegion === region;
                var yearMatch = !year || cardYear === year;
                card.style.display = keywordMatch && regionMatch && yearMatch ? "" : "none";
            });
        }

        [keywordInput, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", filter);
                control.addEventListener("change", filter);
            }
        });

        filter();
    });
})();
