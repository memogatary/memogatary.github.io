
// Theme loader: apply saved theme as early as possible
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('theme-dark');
}


class SiteHeader extends HTMLElement {
  connectedCallback() { this.render(); }
  render() {
    this.innerHTML = `
      <header class="site-header">
        <nav class="nav container" aria-label="Primary">
          <div class="brand"><a href="/">Memogatary</a></div>
          <div class="menu" role="menubar">
            <a role="menuitem" href="/about/">About</a>

            <div class="dropdown" role="none">
              <button aria-haspopup="true" aria-expanded="false">Blog ▾</button>
              <div class="dropdown-panel" role="menu">
                <a role="menuitem" href="/blog/vi/"><strong>Vietnamese</strong><small>Bài viết tiếng Việt</small></a>
                <a role="menuitem" href="/blog/en/"><strong>English</strong><small>Posts in English</small></a>
                <a role="menuitem" href="/blog/"><strong>All</strong><small>Index of both</small></a>
              </div>
            </div>

            <div class="dropdown" role="none">
              <button aria-haspopup="true" aria-expanded="false">Languages ▾</button>
              <div class="dropdown-panel" role="menu">
                <a role="menuitem" href="/languages/chinese/"><strong>Chinese</strong><small>Vocabulary, Notes, FlashCards</small></a>
              </div>
            </div>

            <a role="menuitem" href="/watch/">Watch</a>
            <a role="menuitem" href="/contact/">Contact</a>

            <!-- THEME TOGGLE -->
            <div class="theme-control">
              <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme"></button>
            </div>
          </div>
        </nav>
      </header>`;
    const btn = this.querySelector('#theme-toggle');
    const setIcon = () => {
      const dark = document.documentElement.classList.contains('theme-dark');
      btn.textContent = dark ? 'Theme: Dark ☀️' : 'Theme: Light 🌙';
      btn.title = dark ? 'Switch to light' : 'Switch to dark';
    };
    btn.addEventListener('click', () => {
      const el = document.documentElement;
      const dark = el.classList.toggle('theme-dark');
      localStorage.setItem('theme', dark ? 'dark' : 'light');
      setIcon();
    });
    setIcon();
  }
}
customElements.define('site-header', SiteHeader);

// === Back-to-parent pill (centered; dark-mode-safe; skips 404 parents) ===
document.addEventListener("DOMContentLoaded", () => {
  // Inject CSS once (strong selectors; override prose & visited)
  if (!document.getElementById("mg-back-pill-style")) {
    const style = document.createElement("style");
    style.id = "mg-back-pill-style";
    style.textContent = `
      .mg-back-holder { margin-top:.75rem; }
      a.mg-back-pill, a.mg-back-pill:link, a.mg-back-pill:visited {
        display:inline-flex; align-items:center; gap:.5rem;
        padding:.375rem .75rem; border-radius:9999px;
        background:#f1f5f9; color:#334155 !important; text-decoration:none !important;
        box-shadow:0 1px 2px rgba(0,0,0,.06); transition:background .2s,color .2s;
        white-space:nowrap;
      }
      a.mg-back-pill:hover { background:#e2e8f0; }
      a.mg-back-pill:focus-visible { outline:2px solid currentColor; outline-offset:2px; }

      /* Dark mode – support multiple togglers + OS dark (unless forced light) */
      html.dark a.mg-back-pill,
      body.dark a.mg-back-pill,
      [data-theme="dark"] a.mg-back-pill { background:#1f2937; color:#e5e7eb !important; }
      html.dark a.mg-back-pill:hover,
      body.dark a.mg-back-pill:hover,
      [data-theme="dark"] a.mg-back-pill:hover { background:#374151; }

      @media (prefers-color-scheme: dark) {
        html:not(.light) a.mg-back-pill { background:#1f2937; color:#e5e7eb !important; }
        html:not(.light) a.mg-back-pill:hover { background:#374151; }
      }
    `;
    document.head.appendChild(style);
  }

  // Normalize path (drop /index.html and trailing slashes)
  const normalize = p => (p.replace(/\/index\.html$/i, "").replace(/\/+$/, "") || "/");
  const currentPath = normalize(location.pathname);
  if (currentPath === "/") return; // hide on Home

  // Generate parents list: /a/b/c -> ["/a/b/","/a/","/"]
  function parentsOf(path) {
    const segs = path.split("/").filter(Boolean);
    const out = [];
    for (let i = segs.length - 1; i >= 0; i--) {
      const parent = "/" + segs.slice(0, i).join("/") + "/";
      out.push(parent === "//" ? "/" : parent);
    }
    if (!out.includes("/")) out.push("/");
    return out;
  }

  // URL existence check
  async function exists(url) {
    try {
      const r = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (r.ok) return true;
      const r2 = await fetch(url, { method: "GET", cache: "no-store" });
      return r2.ok;
    } catch { return false; }
  }

  // Find nearest existing ancestor
  async function resolveParent(path) {
    for (const p of parentsOf(path)) {
      if (p === "/") return "/";
      if (await exists(p)) return p;
      if (await exists(p + "index.html")) return p;
    }
    return "/";
  }

  (async () => {
    const raw = await resolveParent(currentPath);
    const parentPath = raw.length > 1 && !raw.endsWith("/") ? raw + "/" : raw;

    const seg = parentPath.split("/").filter(Boolean).pop() || "home";
    const label = seg === "home" ? "Back to Home"
      : "Back to " + seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    const link = document.createElement("a");
    link.href = parentPath;
    link.className = "mg-back-pill";
    link.setAttribute("aria-label", label);
    link.innerHTML = `<span aria-hidden="true">←</span><span>${label}</span>`;

    const holder = document.createElement("div");
    holder.className = "mg-back-holder";
    holder.appendChild(link);

    // Keep inside the same max-width container as content
    const main = document.querySelector("main.container") ||
      document.querySelector("main.prose") ||
      document.querySelector("main");
    if (main) {
      if (/\bcontainer\b/.test(main.className || "")) {
        main.prepend(holder);
      } else {
        const wrap = document.createElement("div");
        wrap.className = "container";
        wrap.appendChild(holder);
        main.prepend(wrap);
      }
    } else {
      const wrap = document.createElement("div");
      wrap.className = "container";
      wrap.appendChild(holder);
      (document.querySelector("site-header") || document.body).insertAdjacentElement("afterend", wrap);
    }
  })();
});


// === Pillify external media links (dark-mode-safe; prose-friendly) ===
document.addEventListener("DOMContentLoaded", () => {
  // CSS once
  if (!document.getElementById("mg-pills-style")) {
    const style = document.createElement("style");
    style.id = "mg-pills-style";
    style.textContent = `
      a.mg-pill, a.mg-pill:link, a.mg-pill:visited {
        display:inline-flex; align-items:center; gap:.5rem;
        padding:.375rem .75rem; border-radius:9999px;
        background:#f1f5f9; color:#334155 !important; text-decoration:none !important;
        box-shadow:0 1px 2px rgba(0,0,0,.06); transition:background .2s,color .2s;
        white-space:nowrap;
      }
      a.mg-pill:hover { background:#e2e8f0; }
      a.mg-pill:focus-visible { outline:2px solid currentColor; outline-offset:2px; }

      /* Dark mode variants */
      html.dark a.mg-pill,
      body.dark a.mg-pill,
      [data-theme="dark"] a.mg-pill { background:#1f2937; color:#e5e7eb !important; }
      html.dark a.mg-pill:hover,
      body.dark a.mg-pill:hover,
      [data-theme="dark"] a.mg-pill:hover { background:#374151; }

      @media (prefers-color-scheme: dark) {
        html:not(.light) a.mg-pill { background:#1f2937; color:#e5e7eb !important; }
        html:not(.light) a.mg-pill:hover { background:#374151; }
      }

      /* Pill list layout + remove bullets (even with .prose) */
      .mg-pill-list {
        list-style:none; margin:.5rem 0 0 0; padding:0;
        display:flex; flex-wrap:wrap; gap:.5rem;
      }
      .mg-pill-list > li { margin:0; padding:0; list-style:none; }
      .mg-pill-list > li::marker { content:"" !important; }
    `;
    document.head.appendChild(style);
  }

  const main = document.querySelector("main") || document.body;
  if (!main) return;

  // Which domains auto-pillify
  const pillDomains = [
    /(?:^|\.)youtube\.com$/i, /(?:^|\.)youtu\.be$/i,
    /(?:^|\.)facebook\.com$/i,
    /(?:^|\.)open\.spotify\.com$/i,
    /(?:^|\.)podcasts\.apple\.com$/i
  ];
  const isMedia = a => {
    try {
      const u = new URL(a.href, location.origin);
      const host = u.hostname.replace(/^www\./i, "");
      return pillDomains.some(rx => rx.test(host));
    } catch { return false; }
  };

  // Lists: make a row of pills when all links are media or container opts in
  main.querySelectorAll("ul, ol").forEach(list => {
    if (list.closest("nav, site-header, site-footer, header, footer")) return;
    const optIn = list.classList.contains("pill-links") || list.dataset.pillify === "all";
    const anchors = Array.from(list.querySelectorAll(":scope > li > a[href]"));
    if (!anchors.length) return;
    const allMedia = anchors.every(isMedia);
    if (optIn || allMedia) {
      list.classList.add("mg-pill-list");
      anchors.forEach(a => a.classList.add("mg-pill"));
    }
  });

  // Standalone anchors: pillify if inside opt-in container or if media link
  main.querySelectorAll("p a[href], div a[href]").forEach(a => {
    if (a.closest(".mg-pill-list, nav, header, footer, site-header, site-footer")) return;
    const containerOptIn = a.closest(".pill-links,[data-pillify='all']");
    if (containerOptIn || isMedia(a)) a.classList.add("mg-pill");
  });
});