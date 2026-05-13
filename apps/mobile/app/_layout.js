import '../global.css';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import 'react-native-url-polyfill/auto'
import { Slot, useRouter } from 'expo-router';
import ThemeProvider from '../theme/ThemeProvider';
import * as Linking from 'expo-linking';

export default function RootLayout() {
  const router = useRouter()

  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          // Quicksand – titles
          'Quicksand-Regular': require('../assets/fonts/Quicksand-Regular.ttf'),
          'Quicksand-Bold': require('../assets/fonts/Quicksand-Bold.ttf'),
          'Quicksand-SemiBold': require('../assets/fonts/Quicksand-SemiBold.ttf'),
          'Quicksand-Medium': require('../assets/fonts/Quicksand-Medium.ttf'),
          'Quicksand-Light': require('../assets/fonts/Quicksand-Light.ttf'),
          // Montserrat – kept for backwards compatibility
          'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
          'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
          'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
          'Montserrat-Medium': require('../assets/fonts/Montserrat-Medium.ttf'),
          // Inter – body text (loaded via direct TTF paths to avoid broken package index)
          'Inter_400Regular': require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
          'Inter_500Medium': require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
          'Inter_600SemiBold': require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
          'Inter_700Bold': require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
        });
      } catch (e) {
        console.warn('Font loading error:', e);
      } finally {
        setFontLoaded(true);
      }
    }
    loadFonts();

    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (url.includes('/auth/callback')) {
        // Aquí manejas la sesión con Supabase
        router.replace('/'); 
      }

      return () => {
        subscription.remove();
      };
    });

  }, []);

  if (!fontLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <Slot />
      
    </ThemeProvider>
  );
}