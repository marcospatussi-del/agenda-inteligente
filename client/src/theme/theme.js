import { createTheme } from '@mui/material/styles';

// Material Design 3 HSL Harmonious Color Palette
const lightPalette = {
  mode: 'light',
  primary: {
    main: '#6750A4',
    light: '#E8DEF8',
    dark: '#4F378B',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#625B71',
    light: '#E8DEF8',
    dark: '#4A4458',
    contrastText: '#FFFFFF',
  },
  tertiary: {
    main: '#7D5260',
    light: '#FFD8E4',
    dark: '#633B48',
  },
  background: {
    default: '#FEF7FF',
    paper: '#FFFFFF',
    surfaceContainer: '#F7F2FA',
  },
  text: {
    primary: '#1D192B',
    secondary: '#49454F',
  },
  error: {
    main: '#B3261E',
    light: '#F9DEDC',
  },
  success: {
    main: '#2E7D32',
    light: '#E8F5E9',
  },
  warning: {
    main: '#ED6C02',
    light: '#FFF3E0',
  },
  info: {
    main: '#0288D1',
    light: '#E0F7FA',
  },
};

const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#D0BCFF',
    light: '#E8DEF8',
    dark: '#381E72',
    contrastText: '#381E72',
  },
  secondary: {
    main: '#CCC2DC',
    light: '#4A4458',
    dark: '#332D41',
    contrastText: '#332D41',
  },
  tertiary: {
    main: '#EFB8C8',
    light: '#492532',
    dark: '#31111D',
  },
  background: {
    default: '#141218',
    paper: '#211F26',
    surfaceContainer: '#2B2930',
  },
  text: {
    primary: '#E6E0E9',
    secondary: '#CAC4D0',
  },
  error: {
    main: '#F2B8B5',
    light: '#601410',
  },
  success: {
    main: '#81C784',
    light: '#1B5E20',
  },
  warning: {
    main: '#FFB74D',
    light: '#E65100',
  },
  info: {
    main: '#4FC3F7',
    light: '#01579B',
  },
};

export const getMD3Theme = (mode = 'light') => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;

  return createTheme({
    palette,
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800, fontSize: '2.5rem', letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.01em' },
      h3: { fontWeight: 700, fontSize: '1.75rem' },
      h4: { fontWeight: 600, fontSize: '1.5rem' },
      h5: { fontWeight: 600, fontSize: '1.25rem' },
      h6: { fontWeight: 600, fontSize: '1rem' },
      button: { textTransform: 'none', fontWeight: 600, borderRadius: '20px' },
    },
    shape: {
      borderRadius: 16, // MD3 Rounded corners
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            padding: '10px 24px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 6px rgba(0,0,0,0.12)',
            },
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: mode === 'dark' ? '#E8DEF8' : '#4F378B',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backgroundImage: 'none',
            boxShadow: mode === 'dark'
              ? '0px 4px 20px rgba(0,0,0,0.4)'
              : '0px 4px 20px rgba(103, 80, 164, 0.06)',
            border: mode === 'dark' ? '1px solid #36343B' : '1px solid #E7E0EC',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 20,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
          },
        },
      },
    },
  });
};
