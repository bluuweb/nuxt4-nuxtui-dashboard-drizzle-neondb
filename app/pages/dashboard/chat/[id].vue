<script setup lang="ts">
import { Chat } from "@ai-sdk/vue";
import { getTextFromMessage } from "@nuxt/ui/utils/ai";
import { DefaultChatTransport } from "ai";
import { useModels } from "~/composable/use-models";

const input = ref("");
const route = useRoute();
const toast = useToast();

const { model, models } = useModels();

const { data, error } = await useFetch(`/api/chat/${route.params.id}`, {
  method: "GET",
  cache: "force-cache",
});

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 500,
    statusMessage: error.value.statusMessage || "Unknown error",
  });
}

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Chat not found",
  });
}

if (!data.value.chat) {
  throw createError({
    statusCode: 404,
    statusMessage: "Chat not found",
  });
}

const chat = new Chat({
  id: data.value.chat.id,
  messages: data.value.messages,
  transport: new DefaultChatTransport({
    api: `/api/chat/${data.value.chat.id}`,
    body: {
      model: "openai/gpt-5-mini",
    },
  }),
  onError(error) {
    const { message } =
      typeof error.message === "string" && error.message[0] === "{"
        ? JSON.parse(error.message)
        : error;

    toast.add({
      description: message,
      icon: "i-lucide-alert-circle",
      color: "error",
      duration: 0,
    });
  },
});

function onSubmit() {
  if (!input.value.trim()) return;
  chat.sendMessage({ text: input.value });
  input.value = "";
}

onMounted(() => {
  if (data.value?.messages.length === 1) {
    chat.regenerate();
  }
});
</script>

<template>
  <UContainer class="flex-1 flex flex-col gap-4 sm:gap-6">
    <UChatMessages
      should-auto-scroll
      :messages="chat.messages"
      :status="chat.status"
      :spacing-offset="160"
      class="lg:pt-(--ui-header-height) pb-4 sm:pb-6"
    >
      <template #indicator>
        <UButton
          class="px-0"
          color="neutral"
          variant="link"
          loading
          loading-icon="i-lucide-loader"
          label="Thinking..."
        />
      </template>
      <template #content="{ message }">
        <MDC
          :value="getTextFromMessage(message)"
          :cache-key="message.id"
          class="*:first:mt-0 *:last:mb-0"
        />
      </template>
    </UChatMessages>
    <UChatPrompt
      v-model="input"
      @submit="onSubmit"
    >
      <UChatPromptSubmit
        :status="chat.status"
        @stop="chat.stop()"
        @reload="chat.regenerate()"
      />
      <template #footer>
        <ChatModelSelect />
      </template>
    </UChatPrompt>
  </UContainer>
</template>
