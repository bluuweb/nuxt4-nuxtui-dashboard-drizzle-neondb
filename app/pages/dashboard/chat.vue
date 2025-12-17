<template>
  <UDashboardPanel id="chat">
    <template #header>
      <UDashboardNavbar title="Chat">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            label="New Chat"
            v-if="$route.path !== '/dashboard/chat'"
            to="/dashboard/chat"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <NuxtPage />
    </template>
  </UDashboardPanel>
</template>
