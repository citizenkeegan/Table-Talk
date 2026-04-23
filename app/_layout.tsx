import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View, ActivityIndicator, Platform } from 'react-native';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Colors } from '../constants/DesignTokens';

// Inject global WCAG-compliant focus ring styles for web
// Ink (#2D2D2E) on cream = 12.14:1 contrast ratio ✅ WCAG AAA
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    /* Remove default outlines — we use custom focus-visible rings */
    * { outline: none; }

    /* WCAG AA focus ring: 3px ink border, 2px offset for visibility ✅ */
    *:focus-visible {
      outline: 3px solid #2D2D2E;
      outline-offset: 2px;
      border-radius: 20px;
    }

    /* Respect reduced motion — disable all CSS transitions/animations */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Always use the light Cream theme — no dark mode in Claymorphism design
const TableTalkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.cream,
    card: Colors.whiteClay,
    text: Colors.ink,
    border: Colors.mist,
    primary: Colors.sage,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.cream }}>
        <ActivityIndicator color={Colors.sage} />
      </View>
    );
  }

  return (
    <ThemeProvider value={TableTalkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="invite/[campaignId]" options={{ headerShown: false }} />
        <Stack.Screen name="campaign/[id]" options={{ title: 'Campaign', headerTintColor: Colors.ink }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
