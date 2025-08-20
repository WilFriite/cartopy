import { Redirect } from 'expo-router';

/**
 * This component is used only to redirect to the lists page.
 * But as Expo router requires a default screen (equivalent to "/" url),
 * I decided to create this component.
 */
export default function MainScreen() {
  return <Redirect href="/lists" />;
}
