<script setup lang="ts">
import type { NuxtError } from "#app";
import type { RegisterTypeZodSchema } from "#shared/zod/register.schema";
import { registerZodSchema } from "#shared/zod/register.schema";
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";

const toast = useToast();

const { fetch } = useUserSession();

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "Enter your email",
    required: true,
    defaultValue: "test1@test.com",
  },
  {
    name: "username",
    label: "Username",
    type: "text",
    placeholder: "Enter your username",
    required: true,
    defaultValue: "testuser1",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    required: true,
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    placeholder: "Confirm your password",
    required: true,
  },
];

async function onSubmit(payload: FormSubmitEvent<RegisterTypeZodSchema>) {
  try {
    await $fetch("/api/auth/register", {
      method: "POST",
      body: payload.data,
    });
    await navigateTo("/login");
    toast.add({
      title: "Registration Successful",
      description: "Your account has been created successfully.",
      color: "success",
    });
  } catch (error) {
    const err = error as NuxtError;
    toast.add({
      title: "Login Error",
      description: err.statusMessage || "An error occurred during login.",
      color: "error",
    });
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 h-screen">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="registerZodSchema"
        title="Register"
        description="Create a new account."
        icon="i-lucide-user"
        :fields="fields"
        @submit="onSubmit"
      >
        <template #description>
          Already have an account?
          <ULink
            to="/login"
            class="text-primary font-medium"
            >Sign in</ULink
          >.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
