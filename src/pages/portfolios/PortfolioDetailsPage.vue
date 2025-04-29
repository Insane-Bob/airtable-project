<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {airtableService} from '@/services/airtableService';
import {useUserStore} from '@/stores/userStore';
import {
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import Loader from "@/components/Loader.vue";
import LikeButton from "@/components/LikeButton.vue";
import {ArrowLeft, CheckCircle, XCircle, InfoIcon} from "lucide-vue-next";

// Types
interface Project {
  id: string;
  name: string;
  description: string;
  languages: string[];
  status: "TODO" | "WIP" | "FINISHED";
  published: "PUBLISHED" | "NOT PUBLISHED";
  likes: number;
  liked: boolean;
  developers: string[];
  created_at: string;
  userLikes: string[];
}

interface AlertMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const project = ref<Project | null>(null);
const isLoading = ref(true);
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const projectSlug = route.params.slug as string;
const alerts = ref<AlertMessage[]>([]);
let alertCounter = 0;

const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string) => {
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

const statusClass = (status: Project["status"]) => {
  switch (status) {
    case "TODO":
      return "bg-gray-200 text-gray-800";
    case "WIP":
      return "bg-blue-200 text-blue-800";
    case "FINISHED":
      return "bg-green-200 text-green-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

const publishedClass = (published: string) => {
  switch (published) {
    case "Published":
      return "bg-green-200 text-green-800";
    case "Not published":
      return "bg-yellow-200 text-yellow-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

const goBack = () => {
  router.push('/portfolios');
};

const updateProjectLikeStatus = (liked: boolean) => {
  if (project.value) {
    project.value.liked = liked;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

onMounted(async () => {
  try {
    const projectRecord = await airtableService.getProjectBySlug(projectSlug);

    if (!projectRecord) {
      showAlert('error', 'Error', "Project not found");
      router.push('/portfolios');
      return;
    }

    let isLiked = false;
    if (userStore.getAuthStatus) {
      const userRecord = await airtableService.getRecordById("Users", userStore.user.id);
      const userLikedProjects = userRecord?.fields["Liked projects"] || [];
      isLiked = userLikedProjects.includes(projectRecord.id);
    }

    project.value = {
      id: projectRecord.id,
      name: projectRecord.fields.Name,
      description: projectRecord.fields.Description || "No description available",
      languages: projectRecord.fields.LanguagesName || [],
      status: projectRecord.fields.Statut,
      published: projectRecord.fields.Published,
      likes: projectRecord.fields.Likes || 0,
      liked: isLiked,
      developers: projectRecord.fields.DevelopersName || [],
      created_at: projectRecord.fields.CreatedAt || "",
      userLikes: projectRecord.fields["Users Likes Names"] || [],
    };
  } catch (error) {
    console.error("Error while fetching projects", error);
    showAlert('error', 'Error', "Unable to load project details");
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <div class="fixed top-5 right-5 z-50 flex flex-col gap-2 w-80">
      <Alert
          v-for="alert in alerts"
          :key="alert.id"
          :class="[
          'animate-slide-in-right shadow-md',
          alert.type === 'success' ? 'bg-green-50 border-green-500' :
          alert.type === 'info' ? 'bg-blue-50 border-blue-500' :
          'bg-red-50 border-red-500'
        ]"
      >
        <CheckCircle v-if="alert.type === 'success'" class="h-4 w-4 text-green-500 mr-2"/>
        <XCircle v-if="alert.type === 'error'" class="h-4 w-4 text-red-500 mr-2"/>
        <InfoIcon v-if="alert.type === 'info'" class="h-4 w-4 text-blue-500 mr-2"/>
        <AlertTitle>{{ alert.title }}</AlertTitle>
        <AlertDescription>{{ alert.message }}</AlertDescription>
      </Alert>
    </div>

    <!-- Bouton retour -->
    <Button @click="goBack"
            class="mb-6 flex items-center gap-2 bg-pink-500 text-white hover:bg-pink-700 transition-colors duration-300 ease-in-out group hover:cursor-pointer">
      <ArrowLeft class="h-4 w-4 group-hover:-translate-x-1 transition-all"/>
      Back to portfolios
    </Button>

    <Loader v-if="isLoading"/>

    <div v-else-if="project" class="flex flex-col gap-6">
      <Card class="bg-white shadow-xl border border-pink-100 rounded-xl overflow-hidden">
        <CardHeader class="bg-gradient-to-r to-white pb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex-1">
              <CardTitle class="flex flex-col gap-2">
                <h1 class="text-3xl font-bold text-gray-800 border-b border-pink-200 pb-2">
                  {{ project.name }}
                </h1>
                <span class="text-sm text-gray-600 italic">
                  Created on {{ formatDate(project.created_at) }}
                </span>
              </CardTitle>
              <CardDescription class="mt-4 flex flex-wrap gap-3">
                <Badge :class="[statusClass(project.status), 'px-4 py-1 text-sm']">
                  {{ project.status }}
                </Badge>
                <Badge :class="[publishedClass(project.published), 'px-4 py-1 text-sm']">
                  {{ project.published }}
                </Badge>
              </CardDescription>
            </div>
            <div class="flex items-center gap-4">
              <LikeButton
                  :project-id="project.id"
                  :initial-liked="project.liked"
                  :initial-likes="project.likes"
                  :likes="project.userLikes.length"
                  :project-name="project.name"
                  :on-update-like="updateProjectLikeStatus"
                  @show-alert="(data) => showAlert(data.type, data.title, data.message)"
              />
            </div>
          </div>
        </CardHeader>

        <!-- Description -->
        <CardContent class="py-6">
          <div class="prose max-w-none">
            <p class="text-gray-700 text-lg leading-relaxed">{{ project.description }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <!-- Technologies/Languages -->
            <div class="bg-gray-50 p-4 rounded-lg shadow-inner">
              <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Languages
              </h2>
              <div class="flex flex-wrap gap-2">
                <Badge
                    v-for="(language, index) in project.languages"
                    :key="index"
                    class="bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors duration-200"
                >
                  {{ language }}
                </Badge>
                <span v-if="!project.languages || project.languages.length === 0" class="text-gray-500 italic">
                  No stacks specified
                </span>
              </div>
            </div>

            <!-- Developers -->
            <div class="bg-gray-50 p-4 rounded-lg shadow-inner">
              <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Developers
              </h2>
              <div class="flex flex-col gap-2">
                <div
                    v-for="(developer, index) in project.developers"
                    :key="index"
                    class="flex items-center bg-white p-2 rounded-md shadow-sm hover:shadow-md transition-shadow"
                >
                  <div class="h-8 w-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold mr-2">
                    {{ developer.charAt(0) }}
                  </div>
                  <span class="text-gray-800">{{ developer }}</span>
                </div>
                <span v-if="!project.developers || project.developers.length === 0" class="text-gray-500 italic">
                  No developers assigned
                </span>
              </div>
            </div>
          </div>

          <!-- Project Likes -->
          <div class="mt-8 bg-pink-50 p-5 rounded-lg shadow-sm">
            <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b border-pink-200 pb-2 flex items-center">
              <span class="mr-2">Students who liked this project</span>
              <span class="bg-pink-200 text-pink-800 px-3 py-0.5 rounded-full text-sm">
                {{ project.userLikes.length }}
              </span>
            </h2>

            <div v-if="project.userLikes && project.userLikes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div
                  v-for="(user, index) in project.userLikes"
                  :key="index"
                  class="flex items-center bg-white p-2 rounded-md shadow-sm"
              >
                <div class="h-6 w-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold mr-2 text-xs">
                  {{ user.charAt(0) }}
                </div>
                <span class="text-gray-700 text-sm">{{ user }}</span>
              </div>
            </div>

            <div v-else class="text-gray-500 italic text-center py-4">
              No likes yet. Be the first to like this project!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-else class="flex flex-col items-center justify-center mt-16 bg-white rounded-lg p-8 shadow-lg">
      <XCircle class="w-16 h-16 text-red-400 mb-4"/>
      <h2 class="text-2xl font-semibold text-gray-700 mb-2">Project not found</h2>
      <p class="text-gray-500 mb-6 text-center">The project you're looking for doesn't exist or has been removed</p>
      <Button @click="goBack" class="bg-pink-500 hover:bg-pink-700">
        Return to projects list
      </Button>
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
</style>