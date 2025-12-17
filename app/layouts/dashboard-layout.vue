<script setup lang="ts">
import type { NuxtError } from "#app";
import { LazyModalConfirm } from "#components";
import type { NavigationMenuItem } from "@nuxt/ui";

const { data, refresh: refreshChats } = await useFetch("/api/chat", {
  key: "chats",
  method: "GET",
  transform: (data) =>
    data.map((chat) => ({
      id: chat.id,
      label: chat.title || "",
      to: `/dashboard/chat/${chat.id}`,
      icon: "i-lucide-message-circle",
      slot: "chat" as const,
    })),
});

const route = useRoute();
const toast = useToast();
const overlay = useOverlay();

const deleteModal = overlay.create(LazyModalConfirm, {
  props: {
    title: "Delete Chat",
    description:
      "Are you sure you want to delete this chat? This action cannot be undone.",
  },
});

const deleteChat = async (id: string) => {
  const instance = deleteModal.open();
  const result = await instance.result;

  if (!result) return;

  try {
    await $fetch("/api/chat/" + id, {
      method: "DELETE",
    });

    toast.add({
      title: "Chat deleted",
      description: "The chat has been successfully deleted.",
      icon: "i-lucide-check-circle",
      color: "success",
    });

    await refreshChats();

    if (route.params.id === id) {
      navigateTo("/dashboard/chat");
    }
  } catch (error) {
    const err = error as NuxtError;
    toast.add({
      title: "Error deleting chat",
      description: err.message || "An error occurred while deleting the chat.",
      icon: "i-lucide-alert-circle",
      color: "error",
    });
  }
};

const open = ref(false);

const items = computed<NavigationMenuItem[][]>(() => [
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
      label: "Chat",
      to: "/dashboard/chat",
      icon: "i-lucide-message-circle",
      onSelect: () => {
        open.value = false;
      },
      defaultOpen: true,
      exact: true,
      children: data.value || [],
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
]);
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
        <ClientOnly>
          <UNavigationMenu
            :items="items"
            :collapsed="collapsed"
            orientation="vertical"
            tooltip
            popover
          >
            <template #chat-trailing="{ item }: { item: NavigationMenuItem }">
              <UButton
                size="sm"
                color="neutral"
                variant="ghost"
                icon="i-lucide-trash-2"
                @click.stop.prevent="deleteChat(item.id)"
              />
            </template>
          </UNavigationMenu>
        </ClientOnly>
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
