// Design System Colors

export const colors = {
  // Primary
  primary: '#3B1FD1',       // rgb(0.23, 0.12, 0.82) - button background
  primaryBorder: '#6345FA', // rgb(0.39, 0.27, 0.98) - button border
  primaryHover: '#4B2DE1',

  // Backgrounds
  bgMain: '#0a0a0a',        // main background
  bgSidebar: '#151515',     // sidebar/panel background
  bgSurface: '#1F1F1F',     // surface/card background
  bgElevated: '#141414',    // rgb(0.08, 0.08, 0.08) - elevated containers
  bgInput: '#0a0a0a',       // input background
  bgHover: '#2a2a2a',       // hover state

  // Borders
  line: '#2B2B2B',          // main border/line
  border: '#1a1a1a',        // secondary border
  borderHover: '#333333',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#888888',
  textMuted: '#666666',
  textPlaceholder: '#7D7D7D',

  // Status
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
};

// Component specific values
export const spacing = {
  inputPaddingX: 20,        // px
  inputPaddingY: 16,        // px
  chipPaddingX: 14,         // px
  chipPaddingY: 8,          // px
};

export const radius = {
  default: 10,              // px
  button: 10,               // px
  input: 10,                // px
  chip: 10,                 // px
};

export const sizes = {
  leftSidebarWidth: 282,    // px
  rightSidebarWidth: 288,   // px (72 * 4 = w-72)
};

export const typography = {
  buttonFont: 'Space Grotesk',
  buttonWeight: 500,        // medium
};

// Chip/Tag style
export const chip = {
  paddingX: 14,             // px
  paddingY: 8,              // px
  borderRadius: 10,         // px
  borderWidth: 1,           // px

  // Default state
  default: {
    background: '#1F1F1F',    // rgb(0.12, 0.12, 0.12)
    borderColor: '#2B2B2B',   // Constants.line
  },

  // Selected state
  selected: {
    background: 'rgba(59, 28, 209, 0.4)', // rgb(0.23, 0.11, 0.82) @ 40% opacity
    backgroundBase: '#1F1F1F',             // layered underneath
    borderColor: '#3B1CD1',                // rgb(0.23, 0.11, 0.82)
  },
};

// Dropdown/Select styles
export const dropdown = {
  paddingX: 14,             // px
  paddingY: 8,              // px
  borderRadius: 10,         // px
  borderWidth: 1,           // px
  background: '#1F1F1F',    // rgb(0.12, 0.12, 0.12)
  borderColor: '#2B2B2B',   // Constants.line
};

// Button styles
export const buttons = {
  // Large button (default)
  large: {
    fontSize: 14,           // px
    paddingX: 18,           // px
    paddingY: 12,           // px
    borderRadius: 10,       // px
    letterSpacing: 1.68,    // px
    iconSize: 14,           // px
    gap: 10,                // px between buttons
    containerPadding: 20,   // px
  },
  // Small button (compact)
  small: {
    fontSize: 12,           // px
    paddingX: 14,           // px
    paddingY: 8,            // px
    borderRadius: 8,        // px
    letterSpacing: 1,       // px
    iconSize: 12,           // px
    gap: 8,                 // px between buttons
    containerPadding: 16,   // px
  },
};
