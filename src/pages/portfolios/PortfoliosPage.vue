<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { airtableService } from "@/services/airtableService";
import { ArrowRight, Heart, LogIn, LogOut, UserPlus } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader.vue";


interface AirtableService {
  getAllRecords: (tableName: string, options: any) => Promise<any[]>;
  getRecordById: (tableName: string, id: string) => Promise<any>;
  updateRecord: (tableName: string, id: string, fields: Record<string, any>) => Promise<any>;
}

interface UserStore {
  getAuthStatus: boolean;
  user: {
    id: string;
  };
  isAdmin: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  status: "TODO" | "WIP" | "FINISHED";
  published: "PUBLISHED" | "NOT PUBLISHED";
  likes: number;
  liked: boolean;
}

// Classes
const statusClass = (status: Project["status"]) => {
  switch (status) {
    case "TODO":
      return "bg-gray-200 text-gray-800";
    case "WIP":
      return "bg-blue-200 text-blue-800";
    case "FINISHED":
      return "bg-green-200 text-green-800";
    default:
      return "bg-green-200 text-green-800";
  }
};

const publishedClass = (published: string) => {
  switch (published) {
    case "PUBLISHED":
      return "bg-gray-200 text-gray-800";
    case "NOT PUBLISHED":
      return "bg-yellow-200 text-yellow-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

const projects = ref<Project[]>([]);
const userStore = useUserStore() as UserStore;
const isLoading = ref(false);

onMounted(async () => {
  try {
    isLoading.value = true;
    const records = await (airtableService as AirtableService).getAllRecords("Projects", {
      maxRecords: 100,
      view: "Published View",
    });

    let userLikedProjects: string[] = [];
    if (userStore.getAuthStatus) {
      try {
        const userRecord = await (airtableService as AirtableService).getRecordById("Users", userStore.user.id);
        userLikedProjects = userRecord?.fields["Liked projects"] || [];
      } catch (error) {
        console.error("Error fetching user liked projects:", error);
      }
    }

    for (const record of records) {
      projects.value.push({
        id: record.id,
        name: record.fields.Name,
        description: record.fields.Description || "No description available",
        technologies: record.fields.Technologies || [],
        status: record.fields.Statut,
        published: record.fields.Published,
        likes: record.fields.Likes || 0,
        liked: userLikedProjects.includes(record.id)
      });
    }

  } catch (error) {
    console.error("Error fetching projects from Airtable:", error);
  }

  isLoading.value = false;
});

const toggleLike = async (projectId: string) => {
  const isLoggedIn = userStore.getAuthStatus;

  if (!isLoggedIn) {
    alert("Vous devez être connecté pour liker un projet");
    return;
  }

  const project = projects.value.find((proj) => proj.id === projectId);
  if (!project) return;

  try {
    const userRecord = await (airtableService as AirtableService).getRecordById("Users", userStore.user.id);
    const userLikedProjects = userRecord?.fields["Liked projects"] || [];

    const projectRecord = await (airtableService as AirtableService).getRecordById("Projects", projectId);
    const projectUsersLikes = projectRecord?.fields["Users likes"] || [];

    const isLiked = userLikedProjects.includes(projectId);

    if (isLiked) {
      const updatedUserLikes = userLikedProjects.filter((id: string) => id !== projectId);

      const updatedProjectLikes = projectUsersLikes.filter((id: string) => id !== userStore.user.id);

      await (airtableService as AirtableService).updateRecord("Users", userStore.user.id, {
        "Liked projects": updatedUserLikes
      });

      await (airtableService as AirtableService).updateRecord("Projects", projectId, {
        "Users likes": updatedProjectLikes
      });

      project.liked = false;
      project.likes--;

    } else {
      const updatedUserLikes = [...userLikedProjects, projectId];

      const updatedProjectLikes = [...projectUsersLikes, userStore.user.id];

      await (airtableService as AirtableService).updateRecord("Users", userStore.user.id, {
        "Liked projects": updatedUserLikes
      });

      await (airtableService as AirtableService).updateRecord("Projects", projectId, {
        "Users likes": updatedProjectLikes
      });

      project.liked = true;
      project.likes++;
    }

  } catch (error) {
    console.error("Error updating like status:", error);
  }
};
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100 py-12">
    <div class="container mx-auto px-6 flex-grow">
      <header>
        <div v-if="!userStore.getAuthStatus" class="flex justify-end gap-6 mb-6">
          <a
              href="/login"
              class="flex gap-2 text-gray-700 rounded-md transition duration-200 hover:text-pink-600"
          >
            <LogIn />
            Login
          </a>
          <a
              href="/login"
              class="flex gap-2 text-gray-700 rounded-md transition duration-200 hover:text-pink-600"
          >
            <UserPlus />
            Register
          </a>
        </div>
        <!-- Admin button -->
        <div v-if="userStore.isAdmin" class="flex justify-end items-center mb-6 hover:cursor-pointer">
          <a
              href="/admin"
              class="text-gray-700 rounded-md transition duration-200 hover:text-pink-600"
          >
            <Button
                class="bg-pink-600 text-white hover:bg-pink-700 transition duration-200 hover:cursor-pointer"
            >
              Admin pannel
            </Button>
          </a>
        </div>
        <!-- Logout button -->
        <div v-if="userStore.getAuthStatus" class="flex justify-end items-center mb-6 hover:cursor-pointer">
          <a
              href="/logout"
              class="text-gray-700 rounded-md transition duration-200 hover:text-pink-600"
          >
            <Button
                class="bg-pink-600 text-white hover:bg-pink-700 transition duration-200 hover:cursor-pointer"
            >
              <LogOut />
              Logout
            </Button>
          </a>
        </div>
      </header>

      <!-- Title -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Our Student Projects</h1>
        <p class="text-gray-500 mt-2">
          Browse through the latest student projects and explore their details.
        </p>
      </div>

        <Loader  v-if="isLoading"/>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
            v-for="project in projects"
            :key="project.id"
            class="bg-white shadow-lg rounded-lg overflow-hidden relative group h-max-screen"
        >
          <CardHeader>
            <CardTitle>
              <div class="flex items-center justify-between">
                <h1 class="text-xl">
                  {{ project.name }}
                </h1>
                <button
                    @click="toggleLike(project.id)"
                    class="flex items-center gap-2 ml-2 transition duration-200"
                >
                  <Heart :class="{
                    'stroke-1 stroke-gray-800 text-pink-600 fill-pink-600': project.liked,
                    'stroke-1 stroke-gray-800 text-gray-400 fill-gray-400': !project.liked
                  }" />
                  <span class="text-pink-600">{{project.likes}}</span>
                </button>
              </div>
            </CardTitle>
            <CardDescription class="mt-2">
              <span
                  :class="publishedClass(project.published)"
                  class="px-3 py-1 rounded-full text-xs font-medium"
              >
                {{ project.published }}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-gray-600 mb-4">{{ project.description }}</p>
            <div class="flex flex-wrap gap-2">
              <span
                  v-for="(tech, idx) in project.technologies"
                  :key="idx"
                  class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
              >
                {{ tech }}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <div class="flex justify-between items-center gap-2 w-full group">
              <div class="flex gap-2 items-center">
                <span class="text-gray-600 group-hover:text-pink-600 text-xs font-semibold">
                  See more
                </span>
                <ArrowRight
                    class="text-gray-600 group-hover:text-pink-600 group-hover:translate-x-1 transition-all w-5 h-5"
                />
              </div>
              <span
                  :class="statusClass(project.status)"
                  class="px-3 py-1 rounded-full text-xs font-medium"
              >
                {{ project.status }}
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>