<script setup lang="ts">
const { clear, user } = useUserSession();

const logout = async () => {
  await clear();
  await navigateTo("/login");
};

const { data: profile, error } = await useFetch("/api/user/profile");
</script>

<template>
  <UDashboardPanel id="dashboard">
    <template #header>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            color="error"
            class="capitalize"
            @click="logout"
          >
            Logout
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UContainer>
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
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
