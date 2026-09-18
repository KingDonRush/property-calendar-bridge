export const MAIN_CSS = `:root {
  color-scheme: light;
  --bg-0: #0b1020;
  --bg-1: #121a33;
  --bg-2: #0d1530;
  --border-0: #26315a;
  --border-1: #2a3766;
  --text-0: #f2f5ff;
  --text-1: rgba(242, 245, 255, 0.85);
  --accent-0: #4f7cff;
  --danger-0: #7a2b3a;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --radius-2: 10px;
  --radius-3: 12px;
  --font-sans: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  background: var(--bg-0);
  color: var(--text-0);
}

a {
  color: inherit;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--border-0);
  text-align: left;
  font-size: 14px;
}

th {
  color: var(--text-1);
  font-weight: 600;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-5);
}

.card {
  background: var(--bg-1);
  border: 1px solid var(--border-0);
  border-radius: var(--radius-3);
  padding: var(--space-4);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 12px;
  border-radius: var(--radius-2);
  border: 0;
  background: var(--accent-0);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.btn.secondary {
  background: transparent;
  border: 1px solid var(--border-1);
  color: var(--text-0);
}

.nav {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.nav a {
  padding: 8px 10px;
  border-radius: var(--radius-2);
  border: 1px solid transparent;
  color: var(--text-1);
}

.nav a.active {
  border-color: var(--border-1);
  color: var(--text-0);
  background: var(--bg-2);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.muted {
  color: var(--text-1);
}




#mobile-menu-toggle {
  display: none;
}

  /* Hide text, show icon on mobile for pagination */
  .pagination-text {
    display: inline;
  }

  @media (max-width: 768px) {
    .pagination-text {
      display: none;
    }

    .pagination-btn {
      padding: 8px 12px !important;
    }
  }


/* Sources Form Grid */
.sources-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 2fr; /* ID smaller, Name larger */
}

.span-full {
  grid-column: 1 / -1;
}

/* Full width for URL maybe? Or just keep 2 cols. Let's make URL span 2 cols if possible, but CSS Grid needs specific item targeting.
   Simplest is just 2 columns flow. */

@media (max-width: 768px) {
  .sources-grid {
    grid-template-columns: 1fr !important; /* Stack on mobile */
  }

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 -16px; /* Bleed to edges on mobile */
  padding: 0 16px;
}

@media (max-width: 768px) {
  .header {
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .container {
    padding: var(--space-4); /* Reduce padding */
  }

  #mobile-menu-toggle {
    display: inline-flex;
    padding: 8px;
  }

  /* Sources Form: Stack vertically on mobile */
  .sources-grid {
    grid-template-columns: 1fr !important;
  }

  /* Stack filters/controls on mobile */
  .controls-row {
    flex-direction: column;
    align-items: stretch !important;
    gap: 12px !important;
  }

  .controls-row h1 {
    width: 100%;
    margin-bottom: 8px !important;
  }

  .controls-row > div {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  /* Mobile Navigation Drawer */
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    background: var(--bg-1);
    border-right: 1px solid var(--border-0);
    padding: var(--space-5);
    flex-direction: column;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: 2px 0 10px rgba(0,0,0,0.5);
  }

  .nav.open {
    transform: translateX(0);
  }

  /* Overlay mainly for closing */
  .nav.open::before {
    content: '';
    position: fixed;
    top: 0;
    left: 280px;
    right: -100vw;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    pointer-events: all;
  }
}
/* Global Input Style */
.input {
  width: 100% !important;
  padding: 8px 12px;
  border: 1px solid var(--border-1);
  border-radius: var(--radius-2);
  background: var(--bg-2);
  color: var(--text-0);
  font-family: inherit;
}

.input:focus {
  outline: 2px solid var(--accent-0);
  border-color: transparent;
}
`;
