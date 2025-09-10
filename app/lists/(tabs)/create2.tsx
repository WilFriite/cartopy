import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Platform, Pressable, useWindowDimensions, View } from 'react-native';
import { Button, ButtonText } from '~/components/ui/btn';

import { Container } from '~/components/ui/container';
import { Input } from '~/components/ui/input';
import { ErrorText, Text } from '~/components/ui/typography';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { lists, type ListInsertType } from '~/db/schema';
import { useMutation } from '@tanstack/react-query';
import { useDrizzle } from '~/hooks/use-drizzle';
import { HStack, VStack } from '~/components/ui/stack';
import { sql } from 'drizzle-orm';
import { KeyboardAvoidingView, KeyboardToolbar } from 'react-native-keyboard-controller';
import { useKbdHeight } from '~/hooks/use-kbd-height';
import { wait } from '~/utils/wait';
import { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import Transition, { useScreenAnimation } from 'react-native-screen-transitions';
import { StyleSheet } from 'react-native-unistyles';
import { ArrowLeft, ArrowLeftCircle } from 'lucide-react-native';
import { Icon } from '~/components/ui/icon';
import { Divider } from '~/components/ui/divider';

const defaultValues: ListInsertType = {
  name: '',
};

const nameSchema = z
  .string()
  .min(3, 'Le nom doit avoir au minimum 3 caractères.')
  .regex(
    /^[a-zA-Z0-9À-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s]+$/,
    'Le nom ne doit contenir que des lettres, chiffres et espaces.'
  );

export default function Create2ListPage() {
  const db = useDrizzle();
  const { height } = useKbdHeight();

  const { sharedBoundTag } = useLocalSearchParams<{
    sharedBoundTag: string;
  }>();

  const { width } = useWindowDimensions();
  const screenProps = useScreenAnimation();

  const saveUserMutation = useMutation({
    mutationFn: async (value: ListInsertType) => {
      await wait(1);
      await db.insert(lists).values({
        ...value,
        items: '',
      });
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ formApi, value }) => {
      console.log(value);
      await saveUserMutation.mutateAsync(value);
      formApi.reset();
    },
  });

  useFocusEffect(() => {
    console.log('gained focus');
    return () => {
      console.log('lost focus');
      form.reset();
    };
  });

  return (
    <>
      <View style={styles.container}>
        <Transition.View sharedBoundTag={sharedBoundTag} style={styles.transitionView(width)}>
          <HStack gap="xl">
            <Pressable onPress={router.back}>
              <Icon as={ArrowLeftCircle} size={30} color="astral" />
            </Pressable>
            <Text size="xl" align="center">
              Création 2 bis gros cul
            </Text>
          </HStack>
          <Divider />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={height.value + 30}
            style={styles.innerContainer}>
            <VStack justify="between">
              <form.Field
                name="name"
                asyncDebounceMs={300}
                validators={{
                  onChange: nameSchema,
                  onChangeAsync: async ({ value }) => {
                    const found = await db.query.lists.findFirst({
                      where: (lists, { like }) =>
                        like(sql`lower(${lists.name})`, value.toLowerCase()),
                    });

                    if (found) return { message: 'Ce nom de liste est déjà pris' };
                    return null;
                  },
                }}>
                {(field) => (
                  <VStack>
                    <Input
                      label="Nom de la liste"
                      size="lg"
                      id={field.name}
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      isError={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors.length > 0 ? (
                      <ErrorText>{field.state.meta.errors[0]?.message}</ErrorText>
                    ) : null}
                  </VStack>
                )}
              </form.Field>

              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button
                    action="normal"
                    isLoading={isSubmitting}
                    disabled={!canSubmit}
                    onPress={form.handleSubmit}>
                    <ButtonText>Créer</ButtonText>
                  </Button>
                )}
              </form.Subscribe>
            </VStack>
          </KeyboardAvoidingView>
        </Transition.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    width: '100%',
    flex: 1,
    // justifyContent: 'center',
    // backgroundColor: 'red',
    padding: theme.spacing.xl,
  },
  transitionView: (width: number) => ({
    width: width * 0.9,
    height: width * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
  }),
}));
