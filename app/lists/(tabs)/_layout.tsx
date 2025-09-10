import { Tabs } from 'expo-router';
import { List, PlusCircle } from 'lucide-react-native';
import { interpolate } from 'react-native-reanimated';
import { Stack } from '~/components/layout/custom-stack';
import { Icon } from '~/components/ui/icon';
import { TabBar } from '~/components/ui/tab-bar';
import Transition from 'react-native-screen-transitions';

export default function ListsPagesLayout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Stack
        // tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="index"
          options={{
            title: 'Mes listes',
            enableTransitions: true,
            // gestureEnabled: true,
            // gestureDirection: ["horizontal", "vertical"],
            // screenStyleInterpolator: ({
            // 	current,
            // 	layouts: { screen },
            // 	progress,
            // 	focused,
            // }) => {
            // 	"worklet";

            // 	/** Combined */
            // 	const scale = interpolate(progress, [0, 1, 2], [0, 1, 0.75]);
            // 	const borderRadius = interpolate(
            // 		progress,
            // 		[0, 1, 2],
            // 		[36, 36, 36],
            // 	);

            // 	/** Vertical */
            // 	const translateY = interpolate(
            // 		current.gesture.normalizedY,
            // 		[-1, 1],
            // 		[-screen.height * 0.5, screen.height * 0.5],
            // 		"clamp",
            // 	);

            // 	/** Horizontal */
            // 	const translateX = interpolate(
            // 		current.gesture.normalizedX,
            // 		[-1, 1],
            // 		[-screen.width * 0.5, screen.width * 0.5],
            // 		"clamp",
            // 	);

            // 	return {
            // 		overlayStyle: {
            // 			backgroundColor: "rgba(0,0,0,0.85)",
            // 			opacity: focused ? interpolate(progress, [0, 1], [0, 1]) : 0,
            // 		},
            // 		contentStyle: {
            // 			transform: [
            // 				{ scale },
            // 				{ translateY: translateY },
            // 				{ translateX },
            // 			],
            // 			borderRadius,
            // 		},
            // 	};
            // },
            // transitionSpec: {
            // 	open: Transition.specs.DefaultSpec,
            // 	close: Transition.specs.DefaultSpec,
            // },
          }}
        />
        <Stack.Screen
          name="create"
          options={{
            title: 'Ajouter',
          }}
        />
        <Stack.Screen
          name="create2"
          options={{
            enableTransitions: true,
            gestureEnabled: true,
            gestureDirection: ['horizontal', 'vertical'],

            screenStyleInterpolator: ({ bounds, activeBoundId, focused, progress }) => {
              'worklet';

              const transformBounds = bounds({
                method: 'size',
                scaleMode: 'match',
                space: 'relative',
                anchor: 'center',
              });
              const { styles } = bounds.get();

              return {
                [activeBoundId]: {
                  ...transformBounds,
                  ...(focused && {
                    borderRadius: interpolate(
                      progress,
                      [0, 1],
                      [(styles.borderRadius as number) ?? 0, 12]
                    ),
                  }),
                },
                overlayStyle: {
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  opacity: focused ? interpolate(progress, [0, 1], [0, 1]) : 0,
                },
              };
            },
            transitionSpec: {
              open: Transition.specs.DefaultSpec,
              close: Transition.specs.DefaultSpec,
            },
          }}
        />
      </Stack>
    </>
  );
}
