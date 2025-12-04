<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const { clear, user } = useUserSession();

const logout = async () => {
  await clear();
  await navigateTo("/login");
};

const { data: profile, error } = await useFetch("/api/user/profile");
</script>

<template>
  <div>
    <h1>Dashboard Page</h1>
    <UButton
      label="Logout"
      @click="logout"
      color="error"
    />

    <div v-if="error">
      <p class="text-red-500">
        Error loading profile: {{ error.statusMessage }}
      </p>
    </div>
    <div v-else-if="profile">
      <p>USER DB: {{ profile.name }}!</p>
      <p>USER SESSION: {{ user?.name }}</p>
    </div>
  </div>
</template>
