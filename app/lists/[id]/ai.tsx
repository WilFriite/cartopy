import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Text } from '~/components/ui/typography';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { VStack } from '~/components/ui/stack';
import { Button, ButtonIcon, ButtonText } from '~/components/ui/btn';
import { Pause, Play } from 'lucide-react-native';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const videoSource =
  'https://cdn77-vid-mp4.xvideos-cdn.com/0SwRQE8uZk6OO69B58jgjA==,1756211005/videos/3gp/d/7/5/xvideos.com_d752066e0e52587cb1c8b52d029433c9.mp4?ui=ODEuNjUuMTQ3LjE0Ny0tL3ZpZGVvLm90dmtsb2g1MDFmL2ZpdG5lc3NfaW5z';

export default function AiTab() {
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.currentTime = 300;
  });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  useFocusEffect(
    useCallback(() => {
      console.log('focus');
      player.play();
      return () => {
        console.log('unfocus');
        player.pause();
      };
    }, [player])
  );

  return (
    <View style={styles.container}>
      <Text size="xl" weight="bold" align="center">
        Mode AI
      </Text>
      <VStack>
        <VideoView style={styles.video} player={player} allowsFullscreen allowsPictureInPicture />
        <Button onPress={() => (isPlaying ? player.pause() : player.play())}>
          <ButtonIcon as={isPlaying ? Pause : Play} />
          <ButtonText>{isPlaying ? 'Pause' : 'Play'}</ButtonText>
        </Button>
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  video: {
    width: '100%',
    height: 200,
  },
}));
