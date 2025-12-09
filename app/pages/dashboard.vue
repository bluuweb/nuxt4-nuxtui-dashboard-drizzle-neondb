<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  layout: "dashboard-layout",
});
</script>

<template>
  <NuxtPage />
</template>
