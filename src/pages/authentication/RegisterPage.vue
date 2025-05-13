<template>
  <div class="flex justify-center items-center h-screen">
    <Card class="w-96">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create an account to get started</CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleRegister">
          <div class="mb-4">
            <Input
              v-model="firstname"
              type="text"
              placeholder="Firstname"
              class="w-full"
            />
          </div>

          <div class="mb-4">
            <Input
              v-model="lastname"
              type="text"
              placeholder="Lastname"
              class="w-full"
            />
          </div>

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

          <div class="mb-4">
            <Input
              v-model.number="year"
              type="number"
              placeholder="Year"
              class="w-full"
            />
          </div>

          <div class="mb-4">
            <Input
              v-model="promotion"
              type="text"
              placeholder="Promotion"
              class="w-full"
            />
          </div>

          <div class="flex justify-center">
            <Button type="submit" class="w-full bg-pink-600 hover:bg-pink-700">Register</Button>
          </div>
        </form>
      </CardContent>

      <CardFooter>
        <p class="text-center text-sm text-gray-500">
          Already have an account?
          <router-link to="/login" class="text-blue-600">Login</router-link>
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
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const firstname = ref("");
const lastname = ref("");
const email = ref("");
const password = ref("");
const year = ref(0);
const promotion = ref("");

const handleRegister = async () => {
  try {
    const hashedPassword = authService.hashPassword(password.value);

    const userData = {
      Firstname: firstname.value,
      Lastname: lastname.value,
      Email: email.value,
      Password: hashedPassword,
      Year: year.value,
      Promotion: promotion.value,
      Roles: "Student",
    };

    const createdUser = await airtableService.createRecord("Users", userData);
    console.log("User registered:", createdUser);

    router.push("/login");
  } catch (error) {
    console.error("Error registering user:", error);
  }
};
</script>
