
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
                <a role="menuitem" href="/languages/chinese/"><strong>Chinese</strong><small>Cards, notes, HSK</small></a>
              </div>
            </div>

            <a role="menuitem" href="/watch/">Watch</a>
            <a role="menuitem" href="/contact/">Contact</a>
          </div>
        </nav>
      </header>`;
  }
}
customElements.define('site-header', SiteHeader);
