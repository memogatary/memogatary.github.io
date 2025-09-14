
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

// --- Back-to-parent pill (centered; works without Tailwind; handles missing parent index.html) ---
document.addEventListener("DOMContentLoaded", () => {
  // Inject minimal CSS once (no Tailwind needed)
  if (!document.getElementById("mg-back-pill-style")) {
    const css = `
      .mg-back-holder { margin-top: .75rem; }
      .mg-back-pill {
        display:inline-flex; align-items:center; gap:.5rem;
        padding:.375rem .75rem; border-radius:9999px;
        background:#f1f5f9; color:#334155; text-decoration:none;
        box-shadow:0 1px 2px rgba(0,0,0,.06); transition:background .2s ease,color .2s ease;
      }
      .mg-back-pill:hover { background:#e2e8f0; }
      /* Dark-mode friendly if your site toggles a .dark class or OS dark */
      html.dark .mg-back-pill { background:#1f2937; color:#e5e7eb; }
      html.dark .mg-back-pill:hover { background:#374151; }
    `.trim();
    const style = document.createElement("style");
    style.id = "mg-back-pill-style";
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Normalize a path: remove /index.html and trailing slashes
  const normalize = (p) => {
    p = p.replace(/\/index\.html$/i, "").replace(/\/+$/, "");
    return p || "/";
  };

  const currentPath = normalize(location.pathname);
  if (currentPath === "/") return; // hide on Home

  // Build list of ancestor candidates for a path
  function parentsOf(path) {
    const segs = path.split("/").filter(Boolean);
    const list = [];
    for (let i = segs.length - 1; i >= 0; i--) {
      const parent = "/" + segs.slice(0, i).join("/") + "/";
      list.push(parent === "//" ? "/" : parent);
    }
    if (!list.includes("/")) list.push("/");
    return list;
  }

  // Check if a URL exists (HEAD first; fallback to GET if needed)
  async function exists(url) {
    try {
      const r = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (r.ok) return true;
      const r2 = await fetch(url, { method: "GET", cache: "no-store" });
      return r2.ok;
    } catch {
      return false;
    }
  }

  // Find the nearest ancestor that actually resolves
  async function resolveParent(path) {
    const candidates = parentsOf(path);
    for (const p of candidates) {
      if (p === "/") return "/";                 // Home always exists
      if (await exists(p)) return p;             // e.g., /languages/
      if (await exists(p + "index.html")) return p; // e.g., /languages/index.html
    }
    return "/"; // fallback
  }

  (async () => {
    const parentPathRaw = await resolveParent(currentPath);
    let parentPath = parentPathRaw;
    if (parentPath.length > 1 && !parentPath.endsWith("/")) parentPath += "/";

    // Label from parent folder name
    const seg = parentPath.split("/").filter(Boolean).pop() || "home";
    const labelText = seg === "home"
      ? "Back to Home"
      : "Back to " + seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    // Create pill
    const link = document.createElement("a");
    link.href = parentPath;
    link.setAttribute("aria-label", labelText);
    link.className = "mg-back-pill";
    link.innerHTML = `<span aria-hidden="true">←</span><span>${labelText}</span>`;

    // Insert INSIDE the page's main container so it aligns with content width
    const main = document.querySelector("main.container") ||
      document.querySelector("main.prose") ||
      document.querySelector("main");

    const holder = document.createElement("div");
    holder.className = "mg-back-holder";
    holder.appendChild(link);

    if (main) {
      // If main already has a container width, just prepend
      if (/\bcontainer\b/.test(main.className || "")) {
        main.prepend(holder);
      } else {
        // Wrap in a container for proper centering
        const wrap = document.createElement("div");
        wrap.className = "container";
        wrap.appendChild(holder);
        main.prepend(wrap);
      }
    } else {
      // Fallback below header
      const wrap = document.createElement("div");
      wrap.className = "container";
      wrap.appendChild(holder);
      const headerEl = document.querySelector("site-header");
      if (headerEl) headerEl.insertAdjacentElement("afterend", wrap);
      else document.body.prepend(wrap);
    }
  })();
});

// --- Pillify external media links site-wide (works without Tailwind) ---
document.addEventListener("DOMContentLoaded", () => {
  // 1) Inject CSS once
  if (!document.getElementById("mg-pills-style")) {
    const style = document.createElement("style");
    style.id = "mg-pills-style";
    style.textContent = `
      .mg-pill {
        display:inline-flex; align-items:center; gap:.5rem;
        padding:.375rem .75rem; border-radius:9999px;
        background:#f1f5f9; color:#334155; text-decoration:none;
        box-shadow:0 1px 2px rgba(0,0,0,.06); transition:background .2s,color .2s;
        white-space:nowrap;
      }
      .mg-pill:hover { background:#e2e8f0; }
      html.dark .mg-pill { background:#1f2937; color:#e5e7eb; }
      html.dark .mg-pill:hover { background:#374151; }
      .mg-pill-list { list-style:none; margin:.5rem 0 0 0; padding:0;
                      display:flex; flex-wrap:wrap; gap:.5rem; }
      .mg-pill-list > li { margin:0; }
    `;
    document.head.appendChild(style);
  }

  // 2) Scope to main content only (don’t touch nav/header/footer)
  const main = document.querySelector("main") || document.body;
  if (!main) return;

  // 3) What to auto-pillify (you can add to this list anytime)
  const pillDomains = [
    /(?:^|\.)youtube\.com$/i, /(?:^|\.)youtu\.be$/i,
    /(?:^|\.)facebook\.com$/i,
    /(?:^|\.)open\.spotify\.com$/i,
    /(?:^|\.)podcasts\.apple\.com$/i
  ];
  const isMediaLink = (a) => {
    try {
      const u = new URL(a.href, location.origin);
      const host = u.hostname.replace(/^www\./i, "");
      return pillDomains.some(rx => rx.test(host));
    } catch { return false; }
  };

  // 4) List mode: <ul>…<li><a href>…</a></li>…
  main.querySelectorAll("ul, ol").forEach(list => {
    if (list.closest("nav, site-header, site-footer, header, footer")) return;

    const optIn = list.classList.contains("pill-links") || list.dataset.pillify === "all";
    const anchors = Array.from(list.querySelectorAll(":scope > li > a[href]"));
    if (!anchors.length) return;

    const allMedia = anchors.every(isMediaLink);
    if (optIn || allMedia) {
      list.classList.add("mg-pill-list");
      anchors.forEach(a => a.classList.add("mg-pill"));
    }
  });

  // 5) Standalone anchors inside content blocks
  main.querySelectorAll("p a[href], div a[href]").forEach(a => {
    if (a.closest(".mg-pill-list, nav, header, footer, site-header, site-footer")) return;
    // Opt-in via container: <div class="pill-links">…</div> or data-pillify="all"
    const container = a.closest(".pill-links,[data-pillify='all']");
    if (container || isMediaLink(a)) {
      a.classList.add("mg-pill");
    }
  });
});
