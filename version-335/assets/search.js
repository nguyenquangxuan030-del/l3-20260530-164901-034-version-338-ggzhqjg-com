(function () {
  const input = document.getElementById("searchInput");
  const title = document.getElementById("searchTitle");
  const summary = document.getElementById("searchSummary");
  const results = document.getElementById("searchResults");
  const form = document.querySelector("[data-live-search-form]");
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  const movies = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];

  function createCard(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "" +
      "<article class=\"movie-card movie-card-compact\" data-movie-card>" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.file) + "\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + " 海报\" loading=\"lazy\">" +
      "<span class=\"poster-glow\"></span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"movie-meta-row\"><span>" + movie.year + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<h3><a href=\"" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "<div class=\"card-actions\"><a href=\"" + escapeHtml(movie.file) + "\">立即观看</a><span>热度 " + movie.hot + "</span></div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[char];
    });
  }

  function runSearch(query) {
    const keyword = String(query || "").trim().toLowerCase();
    if (input) {
      input.value = query;
    }

    if (!keyword) {
      const picks = movies.slice(0, 36);
      if (title) {
        title.textContent = "热门影片推荐";
      }
      if (summary) {
        summary.textContent = "当前展示热度较高的影片，可输入关键词继续检索。";
      }
      if (results) {
        results.innerHTML = picks.map(createCard).join("");
      }
      return;
    }

    const matched = movies.filter(function (movie) {
      const text = [
        movie.title,
        movie.region,
        movie.type,
        movie.genre,
        movie.year,
        (movie.tags || []).join(" "),
        movie.oneLine
      ].join(" ").toLowerCase();
      return text.indexOf(keyword) !== -1;
    }).slice(0, 120);

    if (title) {
      title.textContent = "“" + query + "”的搜索结果";
    }
    if (summary) {
      summary.textContent = "共匹配 " + matched.length + " 部影片，最多展示 120 条结果。";
    }
    if (results) {
      results.innerHTML = matched.map(createCard).join("");
    }
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const value = input ? input.value.trim() : "";
      const target = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
      window.history.replaceState(null, "", target);
      runSearch(value);
    });
  }

  if (input) {
    input.addEventListener("input", function () {
      runSearch(input.value);
    });
  }

  runSearch(initialQuery);
})();
