<template>
  <div class="flex justify-center items-center h-screen">
    <Card class="w-96">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription
          >Enter your credentials to access your account</CardDescription
        >
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <Input
              v-model="email"
              type="email"
              placeholder="Email"
              class="w-full"
            />
          </div>

          <div class="mb-4">
            <Input
              variant="password"
              v-model="password"
              type="password"
              placeholder="Password"
              class="w-full"
            />
          </div>

          <!-- Affichage de l'erreur -->
          <div v-if="error" class="text-red-500 text-sm mt-2 mb-2">
            {{ error }}
          </div>

          <div class="flex justify-center">
            <Button type="submit" class="w-full">Login</Button>
          </div>
        </form>
      </CardContent>

      <CardFooter>
        <p class="text-center text-sm text-gray-500">
          Don't have an account?
          <router-link to="/register" class="text-blue-600"
            >Register</router-link
          >
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup>
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { airtableService } from "@/services/airtableService";
import { authService } from "@/services/authService";
import { useUserStore } from "@/stores/userStore";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();

const email = ref("");
const password = ref("");
const error = ref("");

const handleLogin = async () => {
  error.value = "";

  const user = await authService.loginUser(
    email.value,
    password.value,
    airtableService
  );

  if (user) {
    console.log("Store après login:", userStore.user);

    router.push("/projects");
  } else {
    error.value = "Email or password is incorrect.";
  }
};
</script>
