# Icons

Every icon on this site is an **inline SVG** (pasted straight into the HTML),
not an icon font or a library. That keeps them weightless (~0.5 KB each inside
already-compressed HTML), instantly colourable via `currentColor`, and free of
any third-party dependency.

This folder is the source of truth: the build reads SVGs from here and inlines
them. Drop a replacement in with the same filename and it appears on the next
build. Nothing outside this folder is needed.

## Requirements for a replacement SVG

- **Square viewBox** (`viewBox="0 0 24 24"` or `0 0 256 256`, either is fine)
- **`fill="currentColor"`** on the `<svg>`, and no hard-coded `fill`/`stroke`
  colours on the paths — otherwise hover states and dark backgrounds break
- No `width`/`height` attributes (they are set per usage)
- Optimised: no editor metadata, no `<title>`, no ids

## Where each icon is used

### Share row (all 6 blog articles)
| File | Purpose |
|---|---|
| `linkedin.svg` | Share on LinkedIn |
| `whatsapp.svg` | Share on WhatsApp |
| `x.svg` | Share on X |
| `link-simple-bold.svg` | Copy link (resting) |
| `check-bold.svg` | Copy link (confirmed) |

### Capability cards (about.html)
| File | Card |
|---|---|
| `medal.svg` | 25+ years |
| `flask.svg` | Custom formulation |
| `seal-check.svg` | Global compliance |
| `lightning.svg` | Fast development |
| `test-tube.svg` | Dedicated R&D |
| `target.svg` | Consistent quality |

### Application sector tabs (range pages)
| File | Sector |
|---|---|
| `sparkle.svg` | Cosmetics (glass) |
| `stack-simple.svg` | Vacuum metalizing (glass, plastics) |
| `wine.svg` | Liquor (glass) |
| `frame-corners.svg` | Float glass |
| `fork-knife.svg` | Tableware (glass), Ceramics |
| `star-four.svg` | Speciality (glass, plastics) |
| `sun.svg` | UV protection (glass) |
| `drop.svg` | Clear coat (plastics) |
| `paint-brush.svg` | Acrylic paint (plastics) |
| `paint-roller.svg` | PU paint (plastics) |
| `beer-bottle.svg` | Water bottles (metal) |
| `cooking-pot.svg` | Cookware (metal) |
| `shield-check.svg` | Hardcoats (plastics) + certification cards |

Every file in this folder is in use. If an icon stops being referenced,
delete the file; if you add one, reference it or it is dead weight.

## Sources and licences

- **Phosphor Icons** (MIT) — https://phosphoricons.com — everything except the
  LinkedIn mark. MIT needs no attribution in the page.
- **Simple Icons** (CC0, no attribution required) — https://simpleicons.org —
  `linkedin.svg`, `whatsapp.svg` and `x.svg`, the official brand marks.

**No icon on this site carries an attribution obligation.** Font Awesome Free
was used briefly and removed: its icons are CC BY 4.0, which would have
required a visible credit. If you add icons later, prefer MIT (Phosphor) or
CC0 (Simple Icons) sources so this stays true.

Mixed families are fine: icons are sized by height in CSS, so a Font Awesome
mark (viewBox 448x512) sits optically level with a Phosphor one (256x256).
