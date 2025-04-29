<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert";
import {airtableService} from "@/services/airtableService";
import {ArrowRight, Heart, LogIn, LogOut, UserPlus, CheckCircle, XCircle, ShieldUser} from "lucide-vue-next";
import {onMounted, ref} from "vue";
import {useUserStore} from "@/stores/userStore";
import {Button} from "@/components/ui/button";
import Loader from "@/components/Loader.vue";
import LikeButton from '@/components/LikeButton.vue'

// Interfaces
interface AlertMessage {
  id: number;
  type: 'success' | 'error';
  title: string;
  message: string;
}

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
  slug: string;
  description: string;
  languages: string[];
  status: "TODO" | "WIP" | "FINISHED";
  published: "PUBLISHED" | "NOT PUBLISHED";
  likes: number;
  liked: boolean;
}

const alerts = ref<AlertMessage[]>([]);
let alertCounter = 0;

const showAlert = (type: 'success' | 'error', title: string, message: string) => {
  const id = ++alertCounter;
  alerts.value.push({id, type, title, message});

  setTimeout(() => {
    removeAlert(id);
  }, 3000);
};

const removeAlert = (id: number) => {
  const index = alerts.value.findIndex(alert => alert.id === id);
  if (index !== -1) {
    alerts.value.splice(index, 1);
  }
};


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
    case "Published":
      return "bg-gray-200 text-gray-800";
    case "Not published":
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
        slug: record.fields.Slug,
        description: record.fields.Description || "No description available",
        languages: record.fields.LanguagesName || [],
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
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100 py-12">
    <div class="container mx-auto px-6 flex-grow">
      <!-- Zone des alertes -->
      <div class="fixed top-5 right-5 z-50 flex flex-col gap-2 w-80">
        <Alert
            v-for="alert in alerts"
            :key="alert.id"
            :class="[
            'animate-slide-in-right shadow-md',
            alert.type === 'success' ? 'bg-pink-50 border-pink-500' : 'bg-red-50 border-red-500'
          ]"
        >
          <CheckCircle v-if="alert.type === 'success'" class="h-4 w-4 text-pink-500 mr-2"/>
          <XCircle v-else class="h-4 w-4 text-red-500 mr-2"/>
          <AlertTitle>{{ alert.title }}</AlertTitle>
          <AlertDescription>
            {{ alert.message }}
          </AlertDescription>
        </Alert>
      </div>

      <header>
        <div v-if="!userStore.getAuthStatus" class="flex justify-end gap-6 mb-6">
          <a
              href="/login"
              class="flex gap-2 text-gray-700 rounded-md transition duration-200 hover:text-pink-600"
          >
            <LogIn/>
            Login
          </a>
          <a
              href="/login"
              class="flex gap-2 text-gray-700 rounded-md transition duration-200 hover:text-pink-600"
          >
            <UserPlus/>
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
              <ShieldUser/>
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
              <LogOut/>
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

      <Loader v-if="isLoading"/>
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
                <LikeButton
                    :project-id="project.id"
                    :initial-liked="project.liked"
                    :initial-likes="project.likes"
                    :project-name="project.name"
                    @show-alert="(data) => showAlert(data.type, data.title, data.message)"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-gray-600 mb-4">{{ project.description }}</p>
            <div class="flex flex-wrap gap-2">
              <span
                  v-for="(language, i) in project.languages"
                  :key="i"
                  class="bg-amber-200 text-gray-800 px-2 py-1 rounded-full text-xs"
              >
                  {{ language }}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <div class="flex justify-between items-center gap-2 w-full group">
              <RouterLink
                  :to="{ name: 'PortfolioDetailsPage', params: { slug: project.slug }}"
                  class="flex gap-2 items-center"
              >
                <span class="text-gray-600 group-hover:text-pink-600 text-xs font-semibold">
                  See more
                </span>
                <ArrowRight
                    class="text-gray-600 group-hover:text-pink-600 group-hover:translate-x-1 transition-all w-5 h-5"
                />
              </RouterLink>
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

<style scoped>
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slideInRight 0.3s ease-out forwards;
}

@keyframes heartBounce {
  0%, 100% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.4);
  }
  60% {
    transform: scale(0.8);
  }
  80% {
    transform: scale(1.2);
  }
}

.animate-heart-bounce {
  animation: heartBounce 0.6s ease;
}
</style>