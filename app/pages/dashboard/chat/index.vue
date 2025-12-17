<script setup lang="ts">
const input = ref("");

const onSubmit = async () => {
  if (!input.value.trim()) return;

  const chat = await $fetch("/api/chat", {
    method: "POST",
    body: {
      input: input.value,
    },
  });

  refreshNuxtData("chats");
  navigateTo("/dashboard/chat/" + chat.id);
};
</script>

<template>
  <UContainer class="flex flex-col flex-1 justify-center gap-4 sm:gap-6 py-8">
    <h1 class="text-3xl sm:text-4xl text-highlighted font-bold">
      How can i help you today?
    </h1>

    <UChatPrompt
      @submit="onSubmit"
      v-model="input"
    >
      <UChatPromptSubmit color="neutral" />
      <template #footer>
        <ChatModelSelect />
      </template>
    </UChatPrompt>
  </UContainer>
</template>
