# UI/UX Pro Max Design System & Craft Directives

This project enforces strict UI/UX Pro Max principles across all components, views, and interactions.

---

## 1. Visual Hierarchy & Typographic Scale
- **High-Contrast Display Pairings**: Use crisp display typography with tight tracking (`tracking-tight` / `tracking-tighter`) for headings and generous line heights (`leading-relaxed` 1.5–1.7) for body text.
- **Mathematical Scale**: Maintain step ratios of ≥1.25 between heading tiers (H1 → H2 → H3).
- **Label Integrity**: Text inside buttons, pills, chips, and badges must remain on ONE line without awkward truncation or wrapping (`whitespace-nowrap`).

---

## 2. Spacing, Padding Math & Radius Consistency
- **Padding Math**: Container outer padding must always equal or exceed inner item padding. Minimum interactive container padding is 16px (sm: 24px).
- **Nested Border Radius Rule**: $\text{Inner Radius} = \text{Outer Radius} - \text{Padding}$.
- **Button Touch Geometry**: Horizontal padding is strictly $2\times$ vertical padding (e.g. `px-5 py-2.5`, `px-6 py-3`).
- **Touch Targets**: Minimum 44px on mobile and touchscreens.

---

## 3. Color Depth & Accessible Neutrals
- **Sophisticated Palette**: Avoid pure `#000000` or `#ffffff`. Use tinted deep slate/emerald neutrals (`#062016`, `#0B3D2E`, `#0f172a`) with subtle saturation (<5%).
- **WCAG AA Compliance**: Minimum 4.5:1 contrast for all text. Never place low-contrast gray text on colored backgrounds.
- **Surface Layering**: Closer elements on the Z-axis receive lighter surfaces and subtle 1px translucent borders (`border-white/10` or `border-black/5`) rather than harsh drop shadows.

---

## 4. Motion & Micro-Interactions
- **Natural Springs & Easings**: Use `motion/react` with spring physics (`stiffness: 300, damping: 25`) or cubic-bezier curves (`[0.25, 0.1, 0.25, 1.0]`).
- **Tactile Feedback**: Interactive elements feature smooth hover lift (`hover:-translate-y-0.5`), active scale down (`active:scale-[0.98]`), and clear focus rings (`focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`).
- **Staggered Entrances**: Complex dashboards animate in with staggered cascade transitions (`staggerChildren: 0.05`).

---

## 5. Anti-Slop Discipline
- **Zero Generic Clichés**: No arbitrary purple-to-blue gradients, no giant unreadable text with 0.1 opacity shadows, no hero metric blocks without contextual meaning.
- **Actionable Density**: Prioritize real data tables, live market arbitrage, spatial maps, and voice assistants over empty decorative placeholders.
