<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const open = ref(false);

const items: NavigationMenuItem[][] = [
  [
    {
      label: "Dashboard Home",
      to: "/dashboard",
      icon: "i-lucide-house",
      onSelect: () => {
        open.value = false;
      },
      exact: true,
    },
    {
      label: "Settings",
      to: "/dashboard/settings",
      icon: "i-lucide-settings",
      defaultOpen: true,
      type: "trigger",
      children: [
        {
          label: "General",
          to: "/dashboard/settings",
          exact: true,
          onSelect: () => {
            open.value = false;
          },
        },
        {
          label: "Members",
          to: "/dashboard/settings/members",
          onSelect: () => {
            open.value = false;
          },
        },
        {
          label: "Security",
          to: "/dashboard/settings/security",
          onSelect: () => {
            open.value = false;
          },
        },
      ],
    },
  ],
];
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      collapsible
      resizable
      :ui="{ footer: 'border-t border-default' }"
      class="bg-elevated/25"
      v-model:open="open"
      id="default"
    >
      <template #default="{ collapsed }">
        <UNavigationMenu
          :items="items"
          :collapsed="collapsed"
          orientation="vertical"
          tooltip
          popover
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
