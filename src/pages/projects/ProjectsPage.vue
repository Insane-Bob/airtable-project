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
import { Search } from "lucide-vue-next";
import { airtableService } from "@/services/airtableService";
import { onMounted, ref, watch } from "vue";

interface Project {
  name: string;
  description: string;
  technologies: string[];
  status: "TODO" | "WIP" | "FINISHED";
  published: "PUBLISHED" | "NOT PUBLISHED";
  likes: number;
  developers: string[];
  languages: string[];
}

const projects = ref<Project[]>([]);
const filteredProjects = ref<Project[]>([]);
const isLoading = ref(true);
const selectedView = ref("All View");
const searchQuery = ref("");
const isSearching = ref(false);

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
      return "bg-green-200 text-green-800";
    case "Not published":
      return "bg-purple-200 text-purple-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

// Recherche
const searchProjects = async () => {
  if (!searchQuery.value.trim()) {
    applyFilters();
    return;
  }

  isSearching.value = true;

  try {
    const formula = `OR(
      FIND(LOWER("${searchQuery.value}"), LOWER({Name})),
      FIND(LOWER("${searchQuery.value}"), LOWER({Description}))
    )`;
    const records = await airtableService.getAllRecords("Projects", {
      maxRecords: 100,
      filterByFormula: formula,
    });

    const searchResults: Project[] = records.map((record) => ({
      name: record.fields.Name,
      description: record.fields.Description || "No description available",
      technologies: record.fields.Technologies || [],
      status: record.fields.Statut,
      published: record.fields.Published,
      likes: record.fields.Likes || 0,
      developers: record.fields.DevelopersName || [],
      languages: record.fields.LanguagesName || [],
    }));

    filteredProjects.value = searchResults;

    if (selectedView.value === "Published View") {
      filteredProjects.value = filteredProjects.value.filter(
          (project) => project.published === "PUBLISHED"
      );
    } else if (selectedView.value === "Not Published View") {
      filteredProjects.value = filteredProjects.value.filter(
          (project) => project.published === "NOT PUBLISHED"
      );
    }
  } catch (error) {
    console.error("Error searching projects:", error);
  } finally {
    isSearching.value = false;
  }
};

const applyFilters = () => {
  if (searchQuery.value.trim()) {
    searchProjects();
    return;
  }

  switch (selectedView.value) {
    case "Published View":
      filteredProjects.value = projects.value.filter(
          (project) => project.published === "PUBLISHED"
      );
      break;
    case "Not Published View":
      filteredProjects.value = projects.value.filter(
          (project) => project.published === "NOT PUBLISHED"
      );
      break;
    default:
      filteredProjects.value = [...projects.value];
  }
};

const filterProjectsByView = (view: string) => {
  selectedView.value = view;
  applyFilters();
};

// Debounce
let searchTimeout: number | null = null;
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchProjects();
  }, 500) as unknown as number;
});

const clearSearch = () => {
  searchQuery.value = "";
  applyFilters();
};

// Récupération initiale
onMounted(async () => {
  try {
    const records = await airtableService.getAllRecords("Projects", {
      maxRecords: 100,
      view: "All View",
    });

    for (const record of records) {
      projects.value.push({
        name: record.fields.Name,
        description: record.fields.Description || "No description available",
        technologies: record.fields.Technologies || [],
        status: record.fields.Statut,
        published: record.fields.Published,
        likes: record.fields.Likes || 0,
        developers: record.fields.DevelopersName || [],
        languages: record.fields.LanguagesName || [],
      });
    }

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

    <!-- Loading -->
    <Loader v-if="isLoading" />

    <!-- Filters + Recherche -->
    <div v-else>
      <div class="mb-6 flex flex-col md:flex-row gap-4">
        <div class="relative flex-1">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                  v-model="searchQuery"
                  placeholder="Searching for a project..."
                  class="pl-8 pr-10"
                  :disabled="isSearching"
              />
              <Button
                  v-if="searchQuery"
                  variant="ghost"
                  size="icon"
                  class="absolute right-1 top-1 h-7 w-7"
                  @click="clearSearch"
              >
                &times;
              </Button>
            </div>
            <Button @click="searchProjects" :disabled="isSearching">
              {{ isSearching ? "Search in progress..." : "Search" }}
            </Button>
          </div>
        </div>

        <Select
            v-model="selectedView"
            @update:modelValue="filterProjectsByView"
            class="md:w-48"
        >
          <SelectTrigger>
            <SelectValue :placeholder="selectedView" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="All View">All</SelectItem>
              <SelectItem value="Published View">Published</SelectItem>
              <SelectItem value="Not Published View">Not Published</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <!-- Résultats -->
      <div v-if="filteredProjects.length === 0" class="text-center py-8">
        <p class="text-gray-500">No projects found for this search or filter.</p>
      </div>

      <!-- Table -->
      <Table v-else>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Technologies</TableHead>
            <TableHead>Developers</TableHead>
            <TableHead>Likes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
              v-for="(project, index) in filteredProjects"
              :key="index"
          >
            <TableCell>{{ project.name }}</TableCell>
            <TableCell>{{ project.description }}</TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-2">
                <span
                    v-for="(tech, i) in project.technologies"
                    :key="i"
                    class="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs"
                >
                  {{ tech }}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-2">
                <span
                    v-for="(dev, i) in project.developers"
                    :key="i"
                    class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                >
                  {{ dev }}
                </span>
              </div>
            </TableCell>
            <TableCell>{{ project.likes }}</TableCell>
            <TableCell>
              <span class="px-3 py-1 rounded-full text-sm" :class="statusClass(project.status)">
                {{ project.status }}
              </span>
            </TableCell>
            <TableCell>
              <span class="px-3 py-1 rounded-full text-sm" :class="publishedClass(project.published)">
                {{ project.published }}
              </span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
