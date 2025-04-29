<script setup lang="ts">
import Loader from "@/components/Loader.vue";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert";
import { Search, CheckCircle, XCircle, InfoIcon } from "lucide-vue-next";
import { airtableService } from "@/services/airtableService";
import { onMounted, ref, watch } from "vue";
import { useUserStore } from '@/stores/userStore';

interface Project {
  id: string;
  name: string;
  description: string;
  status: "TODO" | "WIP" | "FINISHED";
  published: "PUBLISHED" | "NOT PUBLISHED";
  likes: number;
  developers: string[];
  languages: string[];
}

interface AlertMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const projects = ref<Project[]>([]);
const filteredProjects = ref<Project[]>([]);
const isLoading = ref(true);
const selectedView = ref("All View");
const searchQuery = ref("");
const isSearching = ref(false);
const updatingProject = ref<string | null>(null);
const userStore = useUserStore();
const isAdmin = ref(userStore.isAdmin);
const alerts = ref<AlertMessage[]>([]);
let alertCounter = 0;

const statusOptions = ["TODO", "WIP", "FINISHED"];
const publishedOptions = ["Published", "Not published"];

const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string) => {
  const id = ++alertCounter;
  alerts.value.push({ id, type, title, message });

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
  // Fonction existante
};

const publishedClass = (published: string) => {
  // Fonction existante
};

const updateProjectStatus = async (projectId: string, newStatus: Project["status"]) => {
  if (!isAdmin.value) {
    showAlert('info', 'Access denied', 'Only administrators can update project status');
    return;
  }

  updatingProject.value = projectId;

  try {
    await airtableService.updateRecord("Projects", projectId, {
      "Statut": newStatus
    });

    const projectIndex = projects.value.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      projects.value[projectIndex].status = newStatus;
    }

    const filteredIndex = filteredProjects.value.findIndex(p => p.id === projectId);
    if (filteredIndex !== -1) {
      filteredProjects.value[filteredIndex].status = newStatus;
    }

    showAlert('success', 'Status updated', `Project status successfully changed to ${newStatus}`);
  } catch (error) {
    console.error("Error updating project status:", error);
    showAlert('error', 'Update failed', "Couldn't update project status");
  } finally {
    updatingProject.value = null;
  }
};

const updateProjectPublished = async (projectId: string, newPublishedState: string) => {
  if (!isAdmin.value) {
    showAlert('info', 'Access denied', 'Only administrators can update publication status');
    return;
  }

  updatingProject.value = projectId;

  try {
    await airtableService.updateRecord("Projects", projectId, {
      "Published": newPublishedState
    });

    // Mise à jour des données locales
    const projectIndex = projects.value.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      projects.value[projectIndex].published = newPublishedState;
    }

    const filteredIndex = filteredProjects.value.findIndex(p => p.id === projectId);
    if (filteredIndex !== -1) {
      filteredProjects.value[filteredIndex].published = newPublishedState;
    }

    showAlert('success', 'Publication status updated', `Publication status successfully changed to ${newPublishedState}`);
  } catch (error) {
    console.error("Error updating project published status:", error);
    showAlert('error', 'Update failed', "Couldn't update publication status");
  } finally {
    updatingProject.value = null;
  }
};

// Fonctions existantes: searchProjects, applyFilters, filterProjectsByView, clearSearch, etc.

// Récupération initiale avec ID des projets
onMounted(async () => {
  try {
    const records = await airtableService.getAllRecords("Projects", {
      // Configuration existante
    });

    projects.value = records.map((record) => ({
      id: record.id,  // Assurez-vous de récupérer l'ID
      name: record.fields.Name,
      description: record.fields.Description || "No description available",
      technologies: record.fields.Technologies || [],
      status: record.fields.Statut,
      published: record.fields.Published,
      likes: record.fields.Likes || 0,
      developers: record.fields.DevelopersName || [],
      languages: record.fields.LanguagesName || [],
    }));

    filteredProjects.value = [...projects.value];
  } catch (error) {
    console.error("Error fetching projects:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="w-full p-6">
    <h1 class="text-2xl font-semibold mb-4">Available Projects</h1>
    <p class="text-gray-500 mb-4">
      Here are all the projects from students portfolio you can see.
    </p>

    <!-- Système d'alertes -->
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

    <!-- Loading -->
    <Loader v-if="isLoading" />

    <!-- Filters + Recherche -->
    <div v-else>
      <div class="mb-6 flex flex-col md:flex-row gap-4">
        <!-- Code existant pour les filtres et la recherche -->
      </div>

      <!-- Résultats vides -->
      <div v-if="filteredProjects.length === 0" class="text-center py-8">
        <!-- Code existant pour l'état vide -->
      </div>

      <!-- Table -->
      <Table v-else>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Technologies</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Developers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="project in filteredProjects" :key="project.id">
            <TableCell>{{ project.name }}</TableCell>
            <TableCell class="max-w-xs truncate">{{ project.description }}</TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-1">
                <span
                    v-for="(language, idx) in project.languages"
                    :key="idx"
                    class="bg-amber-100 text-amber-800 rounded-full px-2 py-1 text-xs"
                >
                  {{ language }}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div v-if="isAdmin">
                <Select
                    :model-value="project.status"
                    @update:modelValue="(newStatus) => updateProjectStatus(project.id, newStatus)"
                    :disabled="updatingProject === project.id"
                >
                  <SelectTrigger
                      :class="[
                      statusClass(project.status),
                      'w-32 h-8 text-xs',
                      updatingProject === project.id ? 'opacity-50' : ''
                    ]"
                  >
                    <SelectValue :placeholder="project.status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                          v-for="status in statusOptions"
                          :key="status"
                          :value="status"
                          class="text-xs"
                      >
                        {{ status }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <span v-else :class="[statusClass(project.status), 'px-3 py-1 rounded-full text-xs inline-block']">
                {{ project.status }}
              </span>
            </TableCell>
            <TableCell>
              <div v-if="isAdmin">
                <Select
                    :model-value="project.published"
                    @update:modelValue="(newState) => updateProjectPublished(project.id, newState)"
                    :disabled="updatingProject === project.id"
                >
                  <SelectTrigger
                      :class="[
                      publishedClass(project.published),
                      'w-40 h-8 text-xs',
                      updatingProject === project.id ? 'opacity-50' : ''
                    ]"
                  >
                    <SelectValue :placeholder="project.published" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                          v-for="option in publishedOptions"
                          :key="option"
                          :value="option"
                          class="text-xs"
                      >
                        {{ option }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <span v-else :class="[publishedClass(project.published), 'px-3 py-1 rounded-full text-xs inline-block']">
                {{ project.published }}
              </span>
            </TableCell>
            <TableCell>
              <div class="flex flex-col gap-1">
                <span
                    v-for="(dev, idx) in project.developers"
                    :key="idx"
                    class="text-xs"
                >
                  {{ dev }}
                </span>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
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