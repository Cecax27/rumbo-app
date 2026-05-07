export const palette = {
  white: '#F6F6F6',
  black: '#1A1A1A',
  gray100: '#EDEDED',
  gray200: '#E3E3E3',
  gray300: '#B8B8B8',
  gray400: '#999999',
  gray600: '#6E6E6E',
  gray700: '#434343',
  gray800: '#313131',
  gray900: '#242424',
  blue600: '#1E90FF',
  red600: '#E03131',
  green600: '#2F9E44',
  mustard: '#FFD166',
  mint: '#A8E6CF',
  coral: '#FF6F61',
  mustardtdark: '#FFBA19',
  mintdark: '#64D3AB'
};

export const lightTheme = {
  name: 'light',
  ... palette,
  mint:palette.mintdark,
  mustard:palette.mustardtdark,
  background: palette.gray100,
  surface: palette.white,
  text: palette.gray900,
  subtext: palette.gray700,
  primary: palette.mustardtdark,
  border: palette.gray400,
  success: palette.green600,
  error: palette.red600,
  income: palette.mint,
  spending: palette.coral,
};

export const darkTheme = {
  name: 'dark',
  ... palette,
  background: palette.gray900,
  surface: palette.gray800,
  text: palette.white,
  subtext: palette.gray300,
  primary: palette.mustard,
  border: palette.gray600,
  success: palette.green600,
  error: palette.red600,
  income: palette.mint,
  spending: palette.coral,
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};
