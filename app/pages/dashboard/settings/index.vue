<script setup lang="ts">
import type { NuxtError } from "#app";
import type { ProfileTypeZodSchema as ProfileSchema } from "#shared/zod/profile.schema";
import { profileZodSchema as profileSchema } from "#shared/zod/profile.schema";
import type { FormSubmitEvent } from "@nuxt/ui";

const fileRef = ref<HTMLInputElement>();

const { data: user } = await useFetch("/api/user/profile");

const showPreviewModal = ref(false);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const uploading = ref(false);

const profile = reactive<Partial<ProfileSchema>>({
  name: user.value?.name || "",
  email: user.value?.email || "",
  username: user.value?.username || "",
  avatar: user.value?.avatarUrl || "/uploads/avatars/sin-avatar.jpg",
  bio: user.value?.bio || "",
});
const toast = useToast();
async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
  try {
    await $fetch("/api/user/profile", {
      method: "PATCH",
      body: event.data,
    });
    toast.add({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
      color: "success",
    });

    await refreshNuxtData("user-profile");
  } catch (error) {
    const err = error as NuxtError;
    toast.add({
      title: "Profile Update Error",
      description:
        err.statusMessage || "An error occurred during profile update.",
      color: "error",
    });
  }
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;

  if (!input.files?.length) {
    return;
  }

  profile.avatar = URL.createObjectURL(input.files[0]!);

  const file = input.files[0]!;
  // validación básica cliente
  const MAX_BYTES = 2 * 1024 * 1024; // 2 MB (ajusta)
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!allowed.includes(file.type)) {
    toast.add({
      title: "Error",
      description: "Tipo de imagen no permitido",
      color: "error",
    });
    input.value = "";
    return;
  }

  if (file.size > MAX_BYTES) {
    toast.add({
      title: "Error",
      description: "Imagen demasiado grande",
      color: "error",
    });
    input.value = "";
    return;
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  showPreviewModal.value = true;
}

async function confirmReplace() {
  if (!selectedFile.value) return;

  uploading.value = true;

  try {
    const fd = new FormData();
    fd.append("file", selectedFile.value);

    const res = await $fetch("/api/user/avatar", {
      method: "PUT",
      body: fd,
    });

    if (res?.url) {
      profile.avatar = res.url;
      toast.add({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully.",
        color: "success",
      });

      // Sirve para actualizar el menú de usuario también
      await refreshNuxtData("user-profile");
    } else {
      toast.add({
        title: "Error",
        description: "No se recibió URL del servidor",
        color: "error",
      });
    }
  } catch (error) {
    const err = error as NuxtError;
    toast.add({
      title: "Upload Failed",
      description:
        err?.statusMessage ||
        err?.message ||
        "An error occurred during upload.",
      color: "error",
    });
  } finally {
    // limpiar estado
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }
    selectedFile.value = null;
    previewUrl.value = null;
    uploading.value = false;
  }
}

function cancelReplace() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  selectedFile.value = null;
  previewUrl.value = null;
  if (fileRef.value) fileRef.value.value = "";
}

function onFileClick() {
  fileRef.value?.click();
}
</script>

<template>
  <UForm
    id="settings"
    :schema="profileSchema"
    :state="profile"
    @submit="onSubmit"
  >
    <AvatarConfirmModal
      v-model:open="showPreviewModal"
      :preview-url="previewUrl"
      :name="profile.name"
      :loading="uploading"
      @confirm="confirmReplace"
      @cancel="cancelReplace"
    />

    <UPageCard
      title="Profile"
      description="These informations will be displayed publicly."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton
        form="settings"
        label="Save changes"
        color="neutral"
        type="submit"
        class="w-fit lg:ms-auto"
      />
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField
        name="name"
        label="Name"
        description="Will appear on receipts, invoices, and other communication."
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.name"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="email"
        label="Email"
        description="Used to sign in, for email receipts and product updates."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.email"
          type="email"
          autocomplete="off"
          disabled
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="username"
        label="Username"
        description="Your unique username for logging in and your profile URL."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.username"
          type="username"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="avatar"
        label="Avatar"
        description="JPG, GIF or PNG. 1MB Max."
        class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar
            :src="profile.avatar"
            :alt="profile.name"
            size="lg"
          />
          <UButton
            label="Choose"
            color="neutral"
            @click="onFileClick"
          />
          <input
            ref="fileRef"
            type="file"
            class="hidden"
            accept=".jpg, .jpeg, .png, .gif, .webp"
            @change="onFileChange"
          />
        </div>
      </UFormField>
      <USeparator />
      <UFormField
        name="bio"
        label="Bio"
        description="Brief description for your profile. URLs are hyperlinked."
        class="flex max-sm:flex-col justify-between items-start gap-4"
        :ui="{ container: 'w-full' }"
      >
        <UTextarea
          v-model="profile.bio"
          :rows="5"
          autoresize
          class="w-full"
        />
      </UFormField>
    </UPageCard>
  </UForm>
</template>
