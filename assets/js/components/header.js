
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

// --- Back-to-parent pill (centered; handles missing parent index.html) ---
document.addEventListener("DOMContentLoaded", () => {
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

  // Check if a URL exists (HEAD first; fallback to GET if HEAD not allowed)
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
      if (p === "/") return "/";                // Home always exists
      if (await exists(p)) return p;            // try folder/
      if (await exists(p + "index.html")) return p; // try folder/index.html
    }
    return "/"; // fallback
  }

  (async () => {
    const parentPath = await resolveParent(currentPath);

    // Make label from the parent folder name
    const seg = parentPath.split("/").filter(Boolean).pop() || "home";
    const labelText =
      seg === "home"
        ? "Back to Home"
        : "Back to " + seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    // Create the pill button
    const link = document.createElement("a");
    link.href = parentPath;
    link.setAttribute("aria-label", labelText);
    link.className =
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full " +
      "bg-slate-100 text-slate-700 hover:bg-slate-200 transition shadow-sm";
    link.innerHTML = `<span aria-hidden="true">←</span><span>${labelText}</span>`;

    // Insert INSIDE the page's main container so it lines up with content width
    const main = document.querySelector("main.container") ||
                 document.querySelector("main.prose") ||
                 document.querySelector("main");

    if (main) {
      // If main already has the container class, just add a small top margin wrapper
      if (/\bcontainer\b/.test(main.className || "")) {
        const pad = document.createElement("div");
        pad.className = "mt-3";
        pad.appendChild(link);
        main.prepend(pad);
      } else {
        const holder = document.createElement("div");
        holder.className = "container mt-3";
        holder.appendChild(link);
        main.prepend(holder);
      }
    } else {
      // Fallback: place right below the header, wrapped in a container
      const holder = document.createElement("div");
      holder.className = "container mt-3";
      holder.appendChild(link);
      const headerEl = document.querySelector("site-header");
      if (headerEl) headerEl.insertAdjacentElement("afterend", holder);
      else document.body.prepend(holder);
    }
  })();
});
