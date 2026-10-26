// Design tokens for the GP app, read from the Figma "Prototype" section
// (file MqExVSvDOdm90y3efv7kHh, node 3239:39471) via the REST API.
// Counts in comments are how many layers use the value, to show which are the
// system and which are one-offs. Roboto / SF Pro Text in the file belong to the
// mocked iOS keyboard and status bar, which the OS draws for real, so they are
// not tokens here.

export const colors = {
  // Text
  text: '#1F1F1F', // Header Text — primary copy, titles
  textSecondary: '#434343', // header icons — labels, list rows, icons
  textMuted: '#888683', // placeholders, secondary prices, disabled
  textOnDark: '#FEFDFF',
  offWhite: '#FCFCFC', // GrayScale/Off white — hero CTA label
  label: '#555555', // GrayScale/Label — decorative rules, status text
  placeholderText: '#888888', // GrayScale/Placehoder — inactive home tabs

  // Surfaces
  background: '#FEFDFF', // Background white — every screen
  surface: '#F2F2EE', // prompt suggestions, measurement tables, chip borders
  surfaceAlt: '#EFEFF0', // image wells, scan backdrop
  placeholder: '#D9D9D9', // empty image slots

  // Actions
  primary: '#1F1F1F', // filled CTA (buttons are #1F1F1F, not the #1B1B1D variable)
  accent: '#E88860', // Main Color — active tab, points, add-to-cart, prompt history
  danger: '#DE130F', // cart badge, destructive

  // Lines
  border: '#DDDDDD', // tab bar top, muted button outline, dividers
  borderStrong: '#1F1F1F', // secondary button / input outline

  // Overlays
  scrim: 'rgba(31,31,31,0.75)', // long-press menu backdrop, modal scrim
  scrimLight: 'rgba(31,31,31,0.30)', // round icon buttons over photos
} as const;

// Frame geometry (pt at the 430pt design width)
export const layout = {
  designWidth: 430,
  gutter: 16, // side margin on every screen
  headerHeight: 44,
  tabBarHeight: 64,
  buttonHeight: 44,
  buttonGap: 8, // paired buttons are 195 wide
  bottomInset: 32, // CTA inset from the bottom on screens without a tab bar
  gridGap: 16, // product grid: two 191-wide cards
  iconSize: 24,
  iconButton: 28, // round icon buttons (circle)
  thumb: 72, // continue-search / list thumbnails
} as const;

// Auto-layout gaps used in the file: 16 (976), 10 (1063), 8 (504), 4 (720), 2 (264)
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 10,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  none: 0, // buttons and inputs are square
  thumb: 12,
  sheet: 20, // bottom sheets: top corners only
  chip: 24,
  round: 999,
} as const;

export const shadow = {
  // floating action circles (long-press menu), 85 uses
  float: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  // small cards / chips
  hairline: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
} as const;

export const fonts = {
  regular: 'Manrope_400Regular', // 652
  medium: 'Manrope_500Medium', // 696
  semibold: 'Manrope_600SemiBold', // 459
  bold: 'Manrope_700Bold', // 28
} as const;

// Line heights are Figma's (Manrope's default 1.2, or 21.9 on 16pt body).
export const type = {
  display: { fontFamily: fonts.regular, fontSize: 32, lineHeight: 38 },
  headline: { fontFamily: fonts.medium, fontSize: 24, lineHeight: 29 },
  title: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 24 },
  titleMedium: { fontFamily: fonts.medium, fontSize: 20, lineHeight: 24 },
  subtitle: { fontFamily: fonts.regular, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
  bodyRegular: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 19 },
  button: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 17 },
  labelMedium: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 17 },
  labelRegular: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 17 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 14 },
  captionMedium: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 14 },
  overline: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 15, letterSpacing: 1 },
} as const;
