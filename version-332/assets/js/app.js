(function () {
    function selectAll(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function closeSearch(panel) {
        panel.innerHTML = "";
        panel.hidden = true;
    }

    function setupHeaderSearch() {
        selectAll("[data-site-search]").forEach(function (input) {
            var panelId = input.getAttribute("aria-controls");
            var panel = panelId ? document.getElementById(panelId) : null;
            if (!panel) {
                return;
            }

            input.addEventListener("input", function () {
                var q = normalize(input.value);
                if (!q) {
                    closeSearch(panel);
                    return;
                }

                var items = (window.SiteSearchIndex || []).filter(function (item) {
                    return normalize(item.title + " " + item.line + " " + item.year + " " + item.region + " " + item.type + " " + item.channel + " " + item.tags).indexOf(q) !== -1;
                }).slice(0, 8);

                if (!items.length) {
                    panel.innerHTML = '<div class="search-result-item"><div class="search-result-title">没有匹配内容</div></div>';
                    panel.hidden = false;
                    return;
                }

                panel.innerHTML = items.map(function (item) {
                    return '<a class="search-result-item" href="' + item.href + '">' +
                        '<div class="search-result-title">' + escapeHtml(item.title) + '</div>' +
                        '<div class="search-result-line">' + escapeHtml(item.line) + '</div>' +
                    '</a>';
                }).join("");
                panel.hidden = false;
            });

            input.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    var first = panel.querySelector("a");
                    if (first) {
                        window.location.href = first.getAttribute("href");
                    }
                }
                if (event.key === "Escape") {
                    closeSearch(panel);
                }
            });

            document.addEventListener("click", function (event) {
                if (!input.contains(event.target) && !panel.contains(event.target)) {
                    closeSearch(panel);
                }
            });
        });
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupMobileMenu() {
        selectAll("[data-menu-toggle]").forEach(function (button) {
            var target = document.querySelector(button.getAttribute("data-menu-toggle"));
            if (!target) {
                return;
            }

            button.addEventListener("click", function () {
                target.classList.toggle("open");
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var index = 0;

        function activate(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                activate(i);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }
    }

    function setupLocalFilters() {
        var blocks = selectAll("[data-filter-block]");
        blocks.forEach(function (block) {
            var input = block.querySelector("[data-local-search]");
            var select = block.querySelector("[data-local-type]");
            var cards = selectAll("[data-card]", block);
            var empty = block.querySelector("[data-empty]");

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var type = select ? select.value : "all";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var cardType = card.getAttribute("data-type") || "";
                    var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchedType = type === "all" || cardType === type;
                    var show = matchedKeyword && matchedType;
                    card.hidden = !show;
                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            if (select) {
                select.addEventListener("change", apply);
            }

            apply();
        });
    }

    function setupPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }

        var video = player.querySelector("video");
        var playButton = player.querySelector("[data-play]");
        var stream = video ? video.getAttribute("data-stream") : "";
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (!video || !stream || attached) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                attached = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                attached = true;
                return;
            }

            video.src = stream;
            attached = true;
        }

        function start() {
            attach();
            player.classList.add("is-playing");
            video.setAttribute("controls", "controls");
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        if (playButton) {
            playButton.addEventListener("click", start);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupHeaderSearch();
        setupMobileMenu();
        setupHero();
        setupLocalFilters();
        setupPlayer();
    });
})();
