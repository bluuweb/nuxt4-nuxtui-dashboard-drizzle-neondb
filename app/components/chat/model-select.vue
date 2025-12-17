<script setup lang="ts">
import { useModels } from "~/composable/use-models";

const { models, model } = useModels();

const items = models.map((m) => ({
  label: m,
  value: m,
  icon: `i-simple-icons-${m.split("/")[0]}`,
}));
</script>

<template>
  <USelect
    v-model="model"
    :items="items"
    :icon="`i-simple-icons-${model.split('/')[0]}`"
  />
</template>
