<script setup lang="ts">
import type { NuxtError } from "#app";
import type { LoginTypeZodSchema } from "#shared/zod/login.schema";
import { loginZodSchema } from "#shared/zod/login.schema";
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
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    required: true,
  },
];

async function onSubmit(payload: FormSubmitEvent<LoginTypeZodSchema>) {
  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: payload.data,
    });
    await navigateTo("/dashboard");
    toast.add({
      title: "Login Successful",
      description: "You have been logged in successfully.",
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
        :schema="loginZodSchema"
        title="Login"
        description="Enter your credentials to access your account."
        icon="i-lucide-user"
        :fields="fields"
        @submit="onSubmit"
      >
        <template #description>
          Don't have an account?
          <ULink
            to="/register"
            class="text-primary font-medium"
            >Sign up</ULink
          >.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
