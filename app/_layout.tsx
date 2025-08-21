import { useUnistyles } from 'react-native-unistyles';

import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Providers } from '~/components/layout/providers';

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const { theme } = useUnistyles();

  const [fontsLoaded] = useFonts({
    Federant: require('../assets/fonts/Federant/Federant-Regular.ttf'),
    Nunito: require('../assets/fonts/Nunito/Nunito-VariableFont_wght.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hide();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Providers>
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      />
    </Providers>
  );
}
