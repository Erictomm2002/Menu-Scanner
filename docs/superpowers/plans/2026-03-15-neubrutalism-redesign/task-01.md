### Task 1: Add Neubrutal CSS Variables and Utilities

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add Neubrutal CSS variables to :root**

Add after line 128 (after existing --sidebar-* variables):

```css
/* Neubrutal Theme Configuration */
:root {
  /* Background Colors */
  --nb-bg-primary: #FFF9E6;
  --nb-bg-secondary: #FFE5D4;
  --nb-bg-accent: #E8F8F5;
  --nb-bg-white: #FFFFFF;

  /* Primary Colors (Vibrant Pastels) */
  --nb-primary: #FFB347;        /* Orange/peach */
  --nb-primary-hover: #FFA327;
  --nb-secondary: #4ECDC4;      /* Teal/turquoise */
  --nb-secondary-hover: #3DBAB1;
  --nb-accent: #FF6B9D;        /* Pink */
  --nb-accent-hover: #F45A8C;

  /* Neutral Colors */
  --nb-border: #2D3436;        /* Dark gray/black */
  --nb-text: #2D3436;         /* Dark text */
  --nb-text-secondary: #636E72; /* Muted text */

  /* Status Colors */
  --nb-success: #4ECDC4;
  --nb-warning: #FFB347;
  --nb-danger: #FF6B6B;
  --nb-info: #45B7D1;
}
```

- [ ] **Step 2: Add Neubrutal utility classes**

Add after line 218 (after .sr-only):

```css
/* Neubrutal Utility Classes */

/* Border utilities */
.nb-border-2 {
  border: 2px solid var(--nb-border);
}

.nb-border-3 {
  border: 3px solid var(--nb-border);
}

/* Shadow utilities (hard shadows, no blur) */
.nb-shadow-sm {
  box-shadow: 2px 2px 0 var(--nb-border);
}

.nb-shadow-md {
  box-shadow: 3px 3px 0 var(--nb-border);
}

.nb-shadow-lg {
  box-shadow: 4px 4px 0 var(--nb-border);
}

/* Background utilities */
.nb-bg-primary {
  background-color: var(--nb-bg-primary);
}

.nb-bg-secondary {
  background-color: var(--nb-bg-secondary);
}

.nb-bg-accent {
  background-color: var(--nb-bg-accent);
}

.nb-bg-white {
  background-color: var(--nb-bg-white);
}

/* Text utilities */
.nb-text-primary {
  color: var(--nb-text);
}

.nb-text-secondary {
  color: var(--nb-text-secondary);
}

/* Button hover effect - translate up and expand shadow */
.nb-button-hover:hover:not(:disabled) {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 var(--nb-border);
}

/* Button active effect - translate down and remove shadow (pressed in) */
.nb-button-active:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0 var(--nb-border);
}

/* Card hover effect - slight scale */
.nb-card-hover:hover {
  transform: scale(1.02);
  transition: transform 0.15s ease-out;
}

/* Input focus effect */
.nb-input-focus:focus {
  border-color: var(--nb-primary);
  box-shadow: 2px 2px 0 var(--nb-primary);
  outline: none;
}

/* Transitions */
.nb-transition {
  transition: all 0.15s ease-out;
}
```

- [ ] **Step 3: Add Neubrutal theme wrapper class**

Add after pixel-theme utilities:

```css
/* Neubrutal Theme Wrapper */
.neubrutal-theme {
  background-color: var(--nb-bg-primary);
  color: var(--nb-text);
}

/* Reset inherited styles */
.neubrutal-theme h1,
.neubrutal-theme h2,
.neubrutal-theme h3,
.neubrutal-theme h4,
.neubrutal-theme p,
.neubrutal-theme span,
.neubrutal-theme div {
  color: var(--nb-text);
}

.neubrutal-theme a {
  color: var(--nb-primary);
}
```

- [ ] **Step 4: Verify CSS changes**

Run: `npm run dev`
Expected: Dev server starts without errors, no CSS syntax errors

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "feat: add neubrutal CSS variables and utility classes

- Add vibrant pastel color palette
- Add border and shadow utilities (hard shadows)
- Add button hover/active effects
- Add card hover effects
- Add input focus effects
- Add neubrutal theme wrapper class"
```
