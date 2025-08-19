import { Stack } from 'expo-router';
import { Button, ButtonText } from '~/components/ui/btn';

import { Container } from '~/components/ui/container';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { ErrorText, Text } from '~/components/ui/typography';
import { useForm } from '@tanstack/react-form'
import { z } from "zod"
import { lists, type ListInsertType } from '~/db/schema';
import { useMutation } from '@tanstack/react-query';
import { useDrizzle } from '~/hooks/use-drizzle';
import { VStack } from '~/components/ui/stack';

const defaultValues: ListInsertType = {
    name: "",
    items: ""
}

const itemsRegex = /^[A-Za-z0-9 ]+(?:, [A-Za-z0-9 ]+)*(?:[, ])?$/;

const schema = z.object({
    name: z
        .string()
        .min(3, "Le nom doit avoir au minimum 3 caractères.")
        .regex(/^\w+$/, "Le nom ne doit contenir que des caractères alpha-numériques"),
    items: z
        .string()
        .regex(itemsRegex, 'Use letters, numbers, spaces, and ", " as the only separator')
})



export default function CreateListPage() {
    const db = useDrizzle()
    const saveUserMutation = useMutation({
        mutationFn: async (value: ListInsertType) => {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          await db.insert(lists).values(value)
        },
      })

    const form = useForm({
        defaultValues,
        // validators: {
        //     onChange: schema
        // },
        onSubmit: async ({ formApi, value }) => {
            console.log(value);
            await saveUserMutation.mutateAsync(value)
            formApi.reset()
        }
    })

  return (
    <>
      <Stack.Screen options={{ title: 'Ajouter' }} />
      <Container>
        <Text size='xl' align='center'>Création</Text>
        <VStack gap='lg'>
            <form.Field 
                name="name"
                validators={{
                    onChange: schema.shape.name,
                }}
            >
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
                        {
                            field.state.meta.errors.length > 0 ? (
                                <ErrorText>
                                    {field.state.meta.errors[0]?.message}
                                </ErrorText>
                            ) : null
                        }
                    </VStack>
                )}
            </form.Field>

            <form.Field 
                name="items"
                validators={{
                    onChange: schema.shape.items
                }}
            >
                {(field) => (
                    <VStack>
                        <Textarea
                            label="Items à ajouter"
                            size="md"
                            helperText="Séparés par des virgules…"
                            id={field.name}
                            value={field.state.value || ""}
                            onBlur={field.handleBlur}
                            onChangeText={(e) => field.handleChange(e)}
                            isError={field.state.meta.errors.length > 0}
                        />
                        {
                            field.state.meta.errors.length > 0 ? (
                                <ErrorText>
                                    {field.state.meta.errors[0]?.message}
                                </ErrorText>
                            ) : null
                        }
                    </VStack>
                )}
            </form.Field>
            <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                    <Button 
                        variant="solid" 
                        isLoading={isSubmitting} 
                        disabled={!canSubmit}
                        onPress={form.handleSubmit}
                    >
                        <ButtonText>Créer</ButtonText>
                    </Button>
                )}
            />
        </VStack>
      </Container>
    </>
  );
}
