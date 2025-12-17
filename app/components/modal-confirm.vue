<script setup lang="ts">
interface Props {
  title: string;
  description: string;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [boolean];
}>();
</script>

<template>
  <UModal
    :title="title"
    :description="description"
    @close="$emit('close', false)"
    :dismissible="false"
  >
    <template #footer>
      <div class="flex gap-2 justify-end">
        <UButton
          label="Cancel"
          color="neutral"
          variant="ghost"
          @click="$emit('close', false)"
        />
        <UButton
          label="Delete"
          color="error"
          @click="$emit('close', true)"
        />
      </div>
    </template>
  </UModal>
</template>
