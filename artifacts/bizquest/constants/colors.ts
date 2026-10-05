/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#272320',
    tint: '#F2734E',

    // Core surfaces
    background: '#FFF9F1',
    foreground: '#272320',

    // Cards / elevated surfaces
    card: '#FFFEFB',
    cardForeground: '#272320',

    // Primary action color (buttons, links, active states)
    primary: '#F2734E',
    primaryForeground: '#FFFFFF',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E6F3EB',
    secondaryForeground: '#356D58',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#F3ECE3',
    mutedForeground: '#81766D',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#FFE9B6',
    accentForeground: '#795313',

    // Destructive actions (delete, error states)
    destructive: '#D95050',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#EFE3D6',
    input: '#E9DED1',

    // BizQuest brand accents
    gold: '#F5BD3F',
    goldSoft: '#FFF1C9',
    orangeSoft: '#FFE4D7',
    mintSoft: '#E4F2E8',
    mint: '#5BA57F',
    blueSoft: '#E5F1FC',
    blue: '#5A9AD0',
    lavender: '#EEE7FC',
    violet: '#8970CB',
    inkSoft: '#5A514A',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 22,
};

export default colors;
