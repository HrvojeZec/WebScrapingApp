# Design system

The web app answers one question at a glance: where is this product cheapest, and is this a good
price? The price is the main character. It borrows the language of a shelf label in a shop (a big,
narrow, bold number, a yellow sale tag, the old price struck through) and spends boldness on prices
only. Everything else stays calm and neutral.

The tokens live in `apps/web/src/shared/theme/tokens.ts`, and the Mantine theme that uses them in
`apps/web/src/shared/theme/theme.ts`. This document and `tokens.ts` describe the same values: change
both together.

## Colors

Every color has one meaning.

| Token      | Hex       | Role                                                             |
| ---------- | --------- | ---------------------------------------------------------------- |
| `ink`      | `#1C2B45` | Text, header, primary button. Mantine's primary color.           |
| `paper`    | `#FFFFFF` | Background of the page and the cards.                            |
| `shelf`    | `#F3F5F8` | Background of sections, fields and image frames.                 |
| `tag`      | `#FFD23F` | Sale tag and "lowest price" badge. Only next to prices.          |
| `drop`     | `#1E8E5A` | Price went down, real sale. Surfaces and icons only, never text. |
| `dropText` | `#1A7D4F` | The `drop` green as text.                                        |
| `rise`     | `#C8372D` | Price went up, errors.                                           |
| `brand`    | `#F26B3A` | The logo only. Not a button or heading color.                    |
| `muted`    | `#5A6478` | Secondary text: the old price, the store name, hints.            |
| `line`     | `#E2E6EC` | 1 px borders of cards and fields.                                |

`drop` has a contrast of 4.14:1 on `paper`, below the 4.5:1 that WCAG AA asks for text. `dropText`
is the same green darkened by 12 %, which reaches 5.13:1 on `paper` and 4.70:1 on `shelf`.

### Text pairs

Text appears only in these combinations. A unit test
(`apps/web/src/shared/lib/__tests__/contrast.test.ts`) checks each one against WCAG AA (4.5:1).

| Text       | Background | Contrast |
| ---------- | ---------- | -------- |
| `ink`      | `paper`    | 14.18:1  |
| `ink`      | `shelf`    | 12.98:1  |
| `ink`      | `tag`      | 9.82:1   |
| `paper`    | `ink`      | 14.18:1  |
| `rise`     | `paper`    | 5.20:1   |
| `rise`     | `shelf`    | 4.76:1   |
| `dropText` | `paper`    | 5.13:1   |
| `dropText` | `shelf`    | 4.70:1   |
| `muted`    | `paper`    | 5.95:1   |
| `muted`    | `shelf`    | 5.45:1   |

In SCSS modules every token is a CSS variable: `--ss-color-ink`, `--ss-color-drop-text` and so on.
Mantine components use the theme colors (`ink`, `tag`, `drop`, `rise`, `brand`), each a scale of 10
shades with the token itself at shade 6.

## Typography

- **IBM Plex Sans** for the whole interface: Croatian diacritics, tabular figures and good
  legibility at small sizes. Weights 400, 600 and 700.
- **IBM Plex Sans Condensed Bold** for prices and big numbers only (`--font-price`).
- Both fonts are self-hosted through `@fontsource`, never loaded from a font CDN.
- Scale with a ratio of 1.25, in px:

| Token  | Size | Use                                    |
| ------ | ---- | -------------------------------------- |
| `xs`   | 12   | Fine print                             |
| `sm`   | 14   | Secondary text, store badge, old price |
| `md`   | 16   | Body text, `h5`                        |
| `lg`   | 20   | `h4`                                   |
| `xl`   | 25   | `h3`, price on a product card          |
| `xxl`  | 31   | `h2`                                   |
| `xxxl` | 39   | `h1`, price on the product page        |

- Lines of body text stay under 75 characters.
- No ALL CAPS labels, and no single word of a heading in another color.

## Shapes and spacing

- Radius 6 px for fields and buttons (`RADII.field`, Mantine `sm`, the default), 10 px for cards
  (`RADII.card`, Mantine `md`).
- Cards have a 1 px `line` border and no shadow. Shadows are for menus and dialogs only.
- Every spacing is a multiple of 4 px (`SPACING_STEP`). Mantine spacing: `xs` 8, `sm` 12, `md` 16,
  `lg` 24, `xl` 32.
- Content is at most 1200 px wide (`LAYOUT.contentMaxWidth`, the default size of Mantine `Container`),
  centred on the page, with everything inside it left aligned.

## Components

- **`PriceTag`** (`shared/ui/PriceTag`): the price as a shelf label with a flat, `ink` left edge.
  25 px on a card, 39 px on the product page. On sale (a regular price above the current one) the
  label turns `tag` yellow, shows the discount (`−12 %`) and the regular price struck through below
  it. Without a sale it shows the price alone, with no dangling separator.
- **`StoreBadge`** (`shared/ui/StoreBadge`): the store name as text on `shelf`. The app shows no
  store logos.
- **`ProductImage`** (`shared/ui/ProductImage`): the store's photo in a 4:3 frame, so cards in a row
  have the same height. It loads lazily and shows a placeholder when the product has no image or
  the image fails to load. Images are linked from the store, never copied.
- **`ErrorState`** and **`EmptyState`** (`shared/ui`): a failed request says what happened and what
  to do (`apiErrorMessage`; a dead API reads "Poslužitelj trenutno ne odgovara..."), with an
  optional "Pokušaj ponovo". An empty result leads on with a title, a sentence and an action.

## Motion

Tokens live in `shared/theme/motion.ts` (`MOTION`), in seconds:

| Token            | Value                        | Use                                                     |
| ---------------- | ---------------------------- | ------------------------------------------------------- |
| `duration.fast`  | 0.15 s                       | Hover, menus, popovers, tooltips                        |
| `duration.base`  | 0.25 s                       | Page transitions, dialogs, notifications                |
| `duration.slow`  | 0.4 s                        | Larger surfaces, layout changes, each word of a heading |
| `duration.count` | 1.2 s                        | A number rolling up to its value                        |
| `duration.draw`  | 0.8 s                        | The price history line drawing itself from the left     |
| `ease`           | `cubic-bezier(0.2, 0, 0, 1)` | Everything: a fast start and a soft landing             |
| `pageOffset`     | 8 px                         | How far a page rises while it fades in                  |
| `cardScale`      | 0.96                         | A result card grows from it and shrinks to it           |

- A product card's image flies to the product page and back (a shared `layoutId`), and the price
  history line draws itself once when the page opens.
- Search results rearrange when a filter or the sort changes: cards that stay glide to their new
  place, cards that leave fade and shrink out of the grid at once, and new cards fade and grow in.

- Our own transitions move only `transform` and `opacity`. The React Bits effects also animate
  `filter`, a background gradient or the width of a digit, and the price chart draws its line
  with a stroke dash, but only inside their own box. Nothing
  shifts the layout around an effect: a page that leaves is taken out of the flow at once, and a
  rolling number keeps its final width from the start.
- With "reduce motion" switched on in the system, nothing moves or fades: `MotionConfig` and
  Mantine's `respectReducedMotion` stop the transitions, and each effect renders its final state.
- Effects come from [React Bits](https://reactbits.dev) in `shared/vendor/react-bits/`, kept as
  published (license in `THIRD_PARTY_NOTICES.md`). Features use only the wrappers in
  `shared/ui/motion/`: `AnimatedHeading` (words come into focus), `ShimmerText` (a light sweeps
  across a sale heading), `GlowCard` (a soft light follows the pointer), `AnimatedNumber` (digits
  roll up to a price or a discount from `format.ts`) and `PageTransition`.

## Numbers and dates

Every number and date goes through `apps/web/src/shared/lib/format.ts`, in Croatian and in Zagreb
time (`LIMITS.limitTimeZone`):

| Function         | Example                 |
| ---------------- | ----------------------- |
| `formatPrice`    | `1.039,99 €`            |
| `formatDate`     | `24. 11. 2026.`         |
| `formatDateTime` | `24. 11. 2026. u 11:42` |
| `formatDiscount` | `−12 %`                 |

A no-break space keeps `€` and `%` on the same line as the number. Days and months have no leading
zero, as Croatian orthography writes them.

## Writing

- All interface text is in Croatian, in sentence case.
- An error says what happened and what to do next, without "Error!" and without apologies. For
  example: "Harvey Norman trenutno ne odgovara. Prikazujem njegove cijene od 23. 11."
- An empty state invites an action, such as a suggestion to check the spelling or try a broader
  term.
- A link to a store reads "Pogledaj u trgovini" (not "Kupi") and opens in a new tab.
- Internal API messages are never shown. The interface writes its own text for each status.
