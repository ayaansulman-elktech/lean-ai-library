(function () {
  setupThemeToggle();
  const page = document.body.dataset.page;

  if (page === "home") {
    initHome();
  }

  if (page === "article") {
    initArticlePage();
  }

  if (page === "library") {
    initLibraryPage();
  }

  if (page === "updates") {
    initUpdatesPage();
  }

  function setupThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;

    toggleBtn.addEventListener("click", () => {
      const isDark = document.documentElement.classList.toggle("dark-theme");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }

  async function fetchJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Unable to load ${path}`);
    }
    return response.json();
  }

  function normalizeCategory(cat) {
    const map = {
      'agents': 'agent-library',
      'code': 'code-library',
      'knowledge': 'knowledge-library',
      'models': 'model-library',
      'mcp': 'mcp-library'
    };
    return map[cat] || cat;
  }

  async function initHome() {
    const sectionsEl = document.getElementById("article-sections");
    const emptyEl = document.getElementById("empty-state");
    const searchInput = document.getElementById("article-search");
    const searchClear = document.querySelector(".search-clear");

    try {
      const [categories, articles] = await Promise.all([
        fetchJson("data/categories.json"),
        fetchJson("data/articles.json")
      ]);

      renderSections(sectionsEl, categories, articles, { showEmptyCategories: true });

      const allFilterLink = document.querySelector(".category-filter-all");
      const categoryLinks = Array.from(document.querySelectorAll(".category-nav a:not(.category-filter-all)"));
      const categoryIds = new Set(categoryLinks.map((link) => link.getAttribute("href").slice(1)));
      const libraryToolbar = document.querySelector(".library-toolbar");
      const toolbarSpacer = document.querySelector(".library-toolbar-spacer");
      let toolbarFlowHeight = 0;
      let toolbarThreshold = 0;
      let isSearchMode = false;
      let activeSearchCategory = "all";

      const measureToolbar = () => {
        const toolbarStyle = getComputedStyle(libraryToolbar);
        toolbarFlowHeight = libraryToolbar.getBoundingClientRect().height
          + parseFloat(toolbarStyle.marginTop || 0)
          + parseFloat(toolbarStyle.marginBottom || 0);
        toolbarThreshold = libraryToolbar.getBoundingClientRect().top + window.scrollY;
      };

      const syncSearchCategory = () => {
        if (!isSearchMode) return;
        allFilterLink.classList.toggle("is-active", activeSearchCategory === "all");
        categoryLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${activeSearchCategory}`);
        });
      };

      const updateActiveCategory = () => {
        const shouldStick = window.scrollY >= toolbarThreshold;
        libraryToolbar.classList.toggle("is-stuck", shouldStick);
        toolbarSpacer.style.height = shouldStick ? `${toolbarFlowHeight}px` : "0px";

        if (isSearchMode) {
          syncSearchCategory();
          return;
        }

        let activeId = categoryLinks[0].getAttribute("href").slice(1);
        sectionsEl.querySelectorAll(".category-section").forEach((section) => {
          if (categoryIds.has(section.id) && section.getBoundingClientRect().top <= 110) activeId = section.id;
        });
        categoryLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
        });
      };

      const recalculateToolbar = ({ preservePosition = false } = {}) => {
        const wasSticky = libraryToolbar.classList.contains("is-stuck");
        const previousThreshold = toolbarThreshold;

        libraryToolbar.classList.remove("is-stuck");
        toolbarSpacer.style.height = "0px";
        measureToolbar();

        if (preservePosition && wasSticky && previousThreshold) {
          window.scrollBy({ top: toolbarThreshold - previousThreshold, behavior: "auto" });
          measureToolbar();
        }

        updateActiveCategory();
      };

      const applySearchVisibility = () => {
        const query = searchInput.value.trim().toLowerCase();
        const visibleSections = [];

        sectionsEl.querySelectorAll(".category-section").forEach((section) => {
          section.classList.remove("is-search-first");

          const matchesCategory = activeSearchCategory === "all" || section.id === activeSearchCategory;
          
          let visibleCards = 0;
          section.querySelectorAll(".article-card").forEach((card) => {
            const matchesQuery = !query || card.dataset.search.includes(query);
            card.hidden = !matchesQuery;
            if (matchesQuery) visibleCards++;
          });

          const shouldShow = matchesCategory && (!query || visibleCards > 0);
          section.hidden = !shouldShow;
          
          if (shouldShow) visibleSections.push(section);
        });

        if (visibleSections[0]) {
          visibleSections[0].classList.add("is-search-first");
          if (query.length > 0) {
            visibleSections[0].scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
        emptyEl.hidden = visibleSections.length !== 0;
        searchClear.hidden = false;
        syncSearchCategory();
      };

      const enterSearchMode = () => {
        if (isSearchMode) return;
        isSearchMode = true;
        activeSearchCategory = "all";
        document.body.classList.add("is-search-mode");
        allFilterLink.hidden = false;
        applySearchVisibility();
        recalculateToolbar({ preservePosition: true });
      };

      const exitSearchMode = () => {
        if (!isSearchMode) return;
        isSearchMode = false;
        activeSearchCategory = "all";
        searchInput.value = "";
        document.body.classList.remove("is-search-mode");
        allFilterLink.hidden = true;
        allFilterLink.classList.remove("is-active");
        sectionsEl.querySelectorAll(".category-section").forEach((section) => {
          section.hidden = false;
          section.classList.remove("is-search-first");
          section.querySelectorAll(".article-card").forEach(card => card.hidden = false);
        });
        emptyEl.hidden = true;
        searchClear.hidden = true;
        recalculateToolbar({ preservePosition: true });
        updateActiveCategory();
      };

      searchInput.addEventListener("focus", enterSearchMode);
      searchInput.addEventListener("input", () => {
        if (!isSearchMode) enterSearchMode();
        applySearchVisibility();
      });
      searchInput.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        exitSearchMode();
        searchInput.blur();
      });

      searchClear.addEventListener("click", () => {
        if (searchInput.value) {
          searchInput.value = "";
          activeSearchCategory = "all";
          applySearchVisibility();
          searchInput.focus();
          return;
        }

        exitSearchMode();
        searchInput.blur();
      });

      allFilterLink.addEventListener("click", (event) => {
        if (!isSearchMode) return;
        event.preventDefault();
        activeSearchCategory = "all";
        searchInput.value = "";
        applySearchVisibility();
      });

      categoryLinks.forEach((link) => link.addEventListener("click", (event) => {
        if (isSearchMode) {
          exitSearchMode();
        }

        categoryLinks.forEach((item) => item.classList.toggle("is-active", item === link));
      }));

      measureToolbar();
      window.addEventListener("scroll", updateActiveCategory, { passive: true });
      window.addEventListener("resize", () => {
        recalculateToolbar();
      }, { passive: true });
      updateActiveCategory();
    } catch (error) {
      sectionsEl.innerHTML = `<p class="status-message">${escapeHtml(error.message)}</p>`;
    }
  }

  function renderSections(container, categories, articles, { showEmptyCategories = false } = {}) {
    const libraryToolbar = document.querySelector(".library-toolbar");
    let toolbarSpacer = document.querySelector(".library-toolbar-spacer");
    if (!toolbarSpacer) {
      toolbarSpacer = document.createElement("div");
      toolbarSpacer.className = "library-toolbar-spacer";
      toolbarSpacer.setAttribute("aria-hidden", "true");
    }
    if (libraryToolbar && container.contains(libraryToolbar)) libraryToolbar.remove();
    if (container.contains(toolbarSpacer)) toolbarSpacer.remove();
    container.innerHTML = "";
    let toolbarPlaced = false;

    const designCategories = getDesignCategories();

    if (libraryToolbar) {
      container.appendChild(toolbarSpacer);
      container.appendChild(libraryToolbar);
      toolbarPlaced = true;
    }

    designCategories.forEach((designCategory) => {
      const source = categories.find((item) => item.slug === designCategory.slug) || {};
      const category = { ...source, ...designCategory };
      const categoryArticles = articles.filter(a => normalizeCategory(a.category) === category.slug);
      const queryHasResults = showEmptyCategories || categoryArticles.length > 0;
      if (!queryHasResults) return;

      const section = document.createElement("section");
      section.id = category.slug;
      section.className = `category-section category-section--${category.slug}${category.featured ? " category-section--featured" : ""}`;
      section.innerHTML = `
        <div class="category-inner">
          <header class="category-header">
            <h2>${escapeHtml(category.name)}</h2>
            ${category.description ? `<p>${escapeHtml(category.description)}</p>` : ""}
          </header>
          <div class="article-grid">
            ${categoryArticles.map((article) => renderArticleCard(article)).join("")}
          </div>
        </div>
      `;
      container.appendChild(section);
    });

    if (libraryToolbar && !toolbarPlaced) {
      container.appendChild(toolbarSpacer);
      container.appendChild(libraryToolbar);
    }
  }

  function getDesignCategories() {
    return [
      { slug: "agent-library", name: "Agent library" },
      { slug: "code-library", name: "Code Library" },
      { slug: "knowledge-library", name: "Knowledge Librairy" },
      { slug: "mcp-library", name: "MCP Library" },
      { slug: "model-library", name: "Model Library" },
      {
        slug: "ios-ready",
        name: "iOS Librairy",
        featured: true,
        description: "Lean Design reduces every application to its core value moment: the screen that creates understanding, the action that validates the use case, and the metric that determines what happens next."
      }
    ];
  }



  async function initLibraryPage() {
    const titleEl = document.getElementById("library-page-title");
    const descriptionEl = document.getElementById("library-page-description");
    const gridEl = document.getElementById("library-page-grid");
    const emptyEl = document.getElementById("library-page-empty");
    const searchInput = document.getElementById("library-search");
    const searchClear = document.querySelector(".library-search-clear");
    const slug = new URLSearchParams(window.location.search).get("category");

    try {
      const [categories, articles] = await Promise.all([
        fetchJson("data/categories.json"),
        fetchJson("data/articles.json")
      ]);
      const designCategory = getDesignCategories().find((item) => item.slug === slug);

      if (!designCategory) {
        document.title = "Library not found - Cognitive Shift";
        titleEl.textContent = "Library not found";
        descriptionEl.textContent = "This library does not exist or is no longer available.";
        gridEl.hidden = true;
        searchInput.closest(".library-search-pill").hidden = true;
        return;
      }

      const source = categories.find((item) => item.slug === designCategory.slug) || {};
      const category = { ...source, ...designCategory };
      const fallbackDescription = "Cognitive shift is an independant platform built on continuous exposure to advanced AI research from MIT and the latest industry practices from leading Silicon Valley companies, transforming complex ideas into directly applicable frameworks.";

      document.title = `${category.name} - Cognitive Shift`;
      titleEl.textContent = category.name;
      descriptionEl.textContent = category.description || fallbackDescription;

      const categoryArticles = articles.filter(a => normalizeCategory(a.category) === designCategory.slug);
      gridEl.innerHTML = categoryArticles.map(article => renderArticleCard(article)).join("");

      const filterCards = () => {
        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        gridEl.querySelectorAll(".article-card").forEach((card) => {
          const isVisible = !query || card.dataset.search.includes(query);
          card.hidden = !isVisible;
          if (isVisible) visibleCount += 1;
        });

        emptyEl.hidden = visibleCount !== 0;
        searchClear.hidden = query.length === 0;
      };

      searchInput.addEventListener("input", filterCards);
      searchClear.addEventListener("click", () => {
        searchInput.value = "";
        searchInput.focus();
        filterCards();
      });
      filterCards();
    } catch (error) {
      gridEl.innerHTML = `<p class="status-message">${escapeHtml(error.message)}</p>`;
    }
  }

  async function initUpdatesPage() {
    const groupsEl = document.getElementById("updates-groups");
    const historyNav = document.getElementById("updates-history-nav");
    const emptyEl = document.getElementById("updates-empty");
    const searchInput = document.getElementById("updates-search-input");
    const searchClear = document.querySelector(".updates-search-clear");
    const filterButtons = Array.from(document.querySelectorAll("[data-update-filter]"));
    let activeFilter = "all";

    try {
      const articles = await fetchJson("data/articles.json");

      const updateGroups = [
        { id: "updates-17-jun", date: "17 Jun", title: "This week", articles: articles.slice(0, 10) },
        { id: "updates-10-jun", date: "10 Jun", title: "Previous week", articles: articles.slice(10, 18) },
        { id: "updates-03-jun", date: "03 Jun", title: "Earlier", articles: articles.slice(18) }
      ].filter(g => g.articles.length > 0);

      groupsEl.innerHTML = updateGroups.map((group) => {
        const cards = group.articles.map(article => renderArticleCard(article)).join("");

        return `
          <section class="updates-group" id="${escapeAttribute(group.id)}" data-history-date="${escapeAttribute(group.date)}">
            <header class="updates-group-header">
              <h2>${escapeHtml(group.title)}</h2>
              <p>${escapeHtml(group.date)} &middot; ${group.articles.length} new blocks</p>
            </header>
            <div class="updates-grid">${cards}</div>
          </section>
        `;
      }).join("");

      historyNav.innerHTML = updateGroups.map((group, index) => `
        <a class="${index === 0 ? "is-active" : ""}" href="#${escapeAttribute(group.id)}" data-history-target="${escapeAttribute(group.id)}">${escapeHtml(group.date)}</a>
      `).join("");

    const syncFilters = () => {
      filterButtons.forEach((button) => {
        const isActive = button.dataset.updateFilter === activeFilter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    };

    const updateActiveHistory = () => {
      const visibleGroups = Array.from(groupsEl.querySelectorAll(".updates-group:not([hidden])"));
      if (!visibleGroups.length) return;
      let activeId = visibleGroups[0].id;
      visibleGroups.forEach((group) => {
        if (group.getBoundingClientRect().top <= 150) activeId = group.id;
      });
      historyNav.querySelectorAll("[data-history-target]").forEach((link) => {
        link.classList.toggle("is-active", link.dataset.historyTarget === activeId);
      });
    };

    const applyFilters = () => {
      const query = searchInput.value.trim().toLowerCase();
      let totalVisible = 0;

      groupsEl.querySelectorAll(".updates-group").forEach((group) => {
        let groupVisible = 0;
        group.querySelectorAll(".article-card").forEach((card) => {
          const matchesCategory = activeFilter === "all" || card.dataset.category === activeFilter;
          const matchesQuery = !query || card.dataset.search.includes(query);
          const shouldShow = matchesCategory && matchesQuery;
          card.hidden = !shouldShow;
          if (shouldShow) groupVisible += 1;
        });
        group.hidden = groupVisible === 0;
        totalVisible += groupVisible;
        const historyLink = historyNav.querySelector(`[data-history-target="${group.id}"]`);
        if (historyLink) historyLink.hidden = groupVisible === 0;
      });

      emptyEl.hidden = totalVisible !== 0;
      searchClear.hidden = query.length === 0;
      syncFilters();
      updateActiveHistory();
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.updateFilter;
        applyFilters();
      });
    });

    searchInput.addEventListener("input", applyFilters);
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      searchInput.focus();
      applyFilters();
    });

    historyNav.querySelectorAll("[data-history-target]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const target = document.getElementById(link.dataset.historyTarget);
        if (target && !target.hidden) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    window.addEventListener("scroll", updateActiveHistory, { passive: true });
    applyFilters();
    } catch (error) {
      groupsEl.innerHTML = `<p class="status-message">${escapeHtml(error.message)}</p>`;
    }
  }

  function renderArticleCard(article) {
    const coverPath = article.coverPreviewPath || article.coverPath || 'assets/default_thumbnail.png';
    const normalizedCat = normalizeCategory(article.category);
    const usesDefaultThumbnail = coverPath === 'assets/default_thumbnail.png';
    const searchText = `${article.name} ${normalizedCat} ${article.shortDescription}`.toLowerCase();

    return `
      <article class="article-card design-card" data-category="${escapeAttribute(normalizedCat)}" data-search="${escapeAttribute(searchText)}" aria-label="${escapeAttribute(article.name)}">
        <a class="article-cover-link design-card-cover" href="article.html?id=${encodeURIComponent(article.slug)}">
          <img src="${escapeAttribute(coverPath)}" alt="">
          ${usesDefaultThumbnail ? `<div class="design-card-label" aria-hidden="true">
            <span class="design-card-mark"></span>
            <strong>${escapeHtml(article.name)}</strong>
            <span>${escapeHtml(article.type || 'Article')}</span>
          </div>` : ""}
        </a>
        <div class="article-meta-row">
          <p class="article-short" title="${escapeAttribute(article.shortDescription || article.name)}">${escapeHtml(article.shortDescription || article.name)}</p>
          <a class="download-dot" href="${escapeAttribute(article.contentPath)}" download aria-label="Download ${escapeHtml(article.name)}">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 6.5v11m0 0 5-5m-5 5-5-5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </a>
        </div>
      </article>
    `;
  }

  async function initArticlePage() {
    const target = document.getElementById("article-detail");
    const slug = new URLSearchParams(window.location.search).get("id");

    if (!slug) {
      target.innerHTML = '<p class="status-message">Article missing.</p>';
      return;
    }

    try {
      const article = await fetchJson(`data/articles/${encodeURIComponent(slug)}.json`);
      const contentKind = getContentKind(article);
      const articleFiles = getArticleFiles(article);

      document.title = `${article.name} - Cognitive Shift`;
      target.innerHTML = renderArticleDetail(article, contentKind, articleFiles);

      const copyButton = target.querySelector("[data-copy-command]");
      if (copyButton) {
        copyButton.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(copyButton.dataset.copyCommand);
            copyButton.classList.add("is-copied");
            copyButton.setAttribute("aria-label", "Command copied");
            window.setTimeout(() => {
              copyButton.classList.remove("is-copied");
              copyButton.setAttribute("aria-label", "Copy install command");
            }, 1600);
          } catch {
            copyButton.setAttribute("aria-label", "Unable to copy command");
          }
        });
      }

      const media = target.querySelector(".article-media");
      const showFileTree = () => {
        media.innerHTML = renderFileTree(article, articleFiles);
        media.querySelectorAll("[data-file-index]").forEach((button) => {
          button.addEventListener("click", () => openFile(articleFiles[Number(button.dataset.fileIndex)]));
        });
      };

      const renderMarkdown = (rawMarkdown) => {
        const markdownTarget = media.querySelector("[data-markdown-target]");
        if (window.marked && window.DOMPurify) {
          if (window.hljs) {
            marked.setOptions({
              highlight(code, lang) {
                if (lang && hljs.getLanguage(lang)) return hljs.highlight(code, { language: lang }).value;
                return hljs.highlightAuto(code).value;
              }
            });
          }
          markdownTarget.innerHTML = DOMPurify.sanitize(marked.parse(rawMarkdown));
        } else {
          markdownTarget.textContent = rawMarkdown;
        }
      };

      const openFile = async (file) => {
        if (!file) return;
        media.innerHTML = renderFileViewer(file);
        media.querySelector("[data-back-to-files]").addEventListener("click", showFileTree);

        if (file.kind === "json") {
          let jsonContent = file.content || "";
          if (!jsonContent) jsonContent = "File preview unavailable.";
          try {
            jsonContent = JSON.stringify(JSON.parse(jsonContent), null, 2);
          } catch {
            // Keep non-JSON error text readable.
          }
          media.querySelector("[data-code-target]").textContent = jsonContent;
          return;
        }

        let rawMarkdown = file.content || "";
        renderMarkdown(rawMarkdown || "Markdown preview unavailable.");
      };

      if (contentKind !== "pdf") showFileTree();
    } catch (error) {
      target.innerHTML = `<p class="status-message">${escapeHtml(error.message)}</p>`;
    }
  }

  function renderArticleDetail(article, contentKind, files) {
    const coverPath = article.coverPreviewPath || article.coverPath || 'assets/default_thumbnail.png';
    const version = escapeHtml(article.version || "0.1.0");
    const lastUpdated = escapeHtml(article.lastUpdated || article.updatedAt || "07/10/26");
    const command = `npx cognitiveshift ${article.slug}`;

    return `
      <article class="article-layout" data-article-type="${escapeAttribute(contentKind)}" data-content-kind="${escapeAttribute(contentKind)}">
        <div class="article-media">
          ${renderViewer(article, contentKind, files)}
        </div>
        <aside class="article-sidebar">
          <img class="article-sidebar-cover" src="${escapeAttribute(coverPath)}" alt="">
          <h1>${escapeHtml(article.name)}</h1>
          <p class="article-subtitle">${escapeHtml(article.description || article.shortDescription || "")}</p>
          ${article.contentPath ? `<a class="download-button" href="${escapeAttribute(article.contentPath)}" download>download</a>` : ""}

          <div class="npx-command-block">
            <code class="npx-text">${escapeHtml(command)}</code>
            <button class="npx-copy-btn" type="button" aria-label="Copy install command" data-copy-command="${escapeAttribute(command)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>

          <div class="article-footer-meta">
            <div>version: ${version}</div>
            <div>last updated: ${lastUpdated}</div>
          </div>
        </aside>
      </article>
    `;
  }

  function renderViewer(article, contentKind, files) {
    if (contentKind === "pdf") {
      const pdfSrc = `${article.contentPath}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&pagemode=none`;
      return `
        <div class="pdf-viewer-shell">
          <iframe class="viewer-frame" src="${escapeAttribute(pdfSrc)}" title="${escapeAttribute(article.name)} PDF"></iframe>
        </div>
      `;
    }

    return renderFileTree(article, files);

    if (contentKind === "md") {
      return `
        <div class="viewer-header">
          <a class="viewer-back-btn" href="library.html" data-history-back>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="m15 18-6-6 6-6"/></svg>
            back to files
          </a>
        </div>
        <div class="markdown-body" data-markdown-target>
          <div style="display:flex;height:100%;align-items:center;justify-content:center;color:#666;">
            Loading...
          </div>
        </div>
      `;
    }

    // Default or Folder view
    return `
      <div class="file-tree-viewer">
        <div class="file-tree-content">
          <div>${escapeHtml(article.slug)}/</div>
          <div class="file-tree-row"><span>&#9500;&#9472;&#9472; </span><button>block.json</button></div>
          <div class="file-tree-row"><span>&#9492;&#9472;&#9472; </span><button>README.md</button></div>
        </div>
      </div>
    `;
  }

  function renderFileTree(article, files) {
    return `
      <div class="file-tree-viewer">
        <div class="file-tree-content">
          <div>${escapeHtml(article.slug)}/</div>
          ${files.map((file, index) => `
            <div class="file-tree-row">
              <span>${index === files.length - 1 ? "&#9492;&#9472;&#9472;" : "&#9500;&#9472;&#9472;"} </span>
              <button type="button" data-file-index="${index}" ${file.kind !== "md" ? 'disabled title="Only Markdown files can be previewed"' : ""}>${escapeHtml(file.name)}</button>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderFileViewer(file) {
    return `
      <div class="viewer-header">
        <button class="viewer-back-btn" type="button" data-back-to-files>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="m15 18-6-6 6-6"/></svg>
          back to files
        </button>
        <span class="viewer-file-name">${escapeHtml(file.name)}</span>
      </div>
      ${file.kind === "json"
        ? '<pre class="file-code-view" data-code-target></pre>'
        : '<div class="markdown-body" data-markdown-target><p>Loading...</p></div>'}
    `;
  }

  function getArticleFiles(article) {
    const generatedKeys = new Set(["contentPath", "coverPath", "coverPreviewPath", "readme", "skill", "files"]);
    const manifest = Object.fromEntries(Object.entries(article).filter(([key]) => !generatedKeys.has(key)));
    const sourceFiles = flattenFileTree(article.fileTree || []);
    const files = sourceFiles.map((file) => ({
      name: file.name,
      kind: file.name.toLowerCase().endsWith(".md") ? "md" : "file",
      path: "",
      content: file.content || ""
    }));

    if (!files.length) files.push({ name: "block.json", kind: "file", content: JSON.stringify(manifest, null, 2) });

    const readme = files.find((file) => file.name.toLowerCase() === "readme.md");
    const skill = files.find((file) => file.name.toLowerCase() === "skill.md");
    if (article.readme) {
      if (readme) readme.content = article.readme;
      else files.push({ name: "README.md", kind: "md", content: article.readme });
    }
    if (article.skill) {
      if (skill) skill.content = article.skill;
      else files.push({ name: "SKILL.md", kind: "md", content: article.skill });
    }
    if (article.contentPath && getContentKind(article) === "md") {
      files.push({
        name: article.contentPath.split("/").pop() || `${article.slug}.md`,
        kind: "md",
        path: article.contentPath
      });
    }

    (Array.isArray(article.files) ? article.files : []).forEach((file) => {
      if (typeof file === "string") {
        files.push({ name: file.split("/").pop(), kind: file.toLowerCase().endsWith(".md") ? "md" : "file", path: file });
      } else if (file && file.name) {
        files.push({
          name: file.name,
          kind: file.name.toLowerCase().endsWith(".md") ? "md" : "file",
          content: file.content || "",
          path: file.path || ""
        });
      }
    });

    return files.filter((file, index) => files.findIndex((candidate) => candidate.name === file.name) === index);
  }

  function flattenFileTree(nodes, parentPath = "") {
    return nodes.flatMap((node) => {
      const nodePath = node.path || [parentPath, node.name].filter(Boolean).join("/");
      if (node.type === "directory") return flattenFileTree(node.children || [], nodePath);
      return [{ name: nodePath, path: nodePath, content: node.content || "" }];
    });
  }


  function getContentKind(article) {

    const contentPath = String(article.contentPath || "").split(/[?#]/)[0].replace(/\/+$/, "").toLowerCase();
    const declaredType = String(article.type || "").toLowerCase();

    if (contentPath.endsWith(".pdf")) return "pdf";
    if (article.readme || article.skill) return "md";
    if (contentPath.endsWith(".md")) return "md";
    if (contentPath.endsWith("/content") || contentPath === "content") return "folder";
    if (declaredType === "pdf" || declaredType === "md" || declaredType === "folder") return declaredType;
    return declaredType || "file";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }
})();
