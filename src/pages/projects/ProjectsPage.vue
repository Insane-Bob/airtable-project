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
import { airtableService } from "@/services/airtableService";
import { onMounted, ref } from "vue";

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

// Method to filter projects based on the selected view
const filterProjectsByView = (view: string) => {
  selectedView.value = view;

  if (view === "All View") {
    filteredProjects.value = [...projects.value];
  } else if (view === "Published View") {
    filteredProjects.value = projects.value.filter(
      (project) => project.published === "PUBLISHED"
    );
  } else if (view === "Not Published View") {
    filteredProjects.value = projects.value.filter(
      (project) => project.published === "NOT PUBLISHED"
    );
  }
};

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
    console.error("Error fetching projects from Airtable:", error);
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

    <div v-else>
      <div class="mb-4 flex gap-4">
        <!-- Filter by Published View -->
        <Select
          v-model="selectedView"
          @update:modelValue="filterProjectsByView"
        >
          <SelectTrigger class="w-48">
            <SelectValue :placeholder="selectedView" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="All View">All View</SelectItem>
              <SelectItem value="Published View">Published View</SelectItem>
              <SelectItem value="Not Published View"
                >Not Published View</SelectItem
              >
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <!-- Table -->
      <Table>
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
          <TableRow v-for="(project, index) in filteredProjects" :key="index">
            <TableCell>{{ project.name }}</TableCell>

            <TableCell>{{ project.description }}</TableCell>

            <TableCell>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(language, idx) in project.languages"
                  :key="idx"
                  class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs"
                >
                  {{ language }}
                </span>
              </div>
            </TableCell>

            <TableCell>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(developer, idx) in project.developers"
                  :key="idx"
                  class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                >
                  {{ developer }}
                </span>
              </div>
            </TableCell>

            <TableCell>
              <span class="text-sm font-medium">{{ project.likes }}</span>
            </TableCell>

            <TableCell>
              <span
                :class="statusClass(project.status)"
                class="px-3 py-1 rounded-full text-xs font-medium"
              >
                {{ project.status }}
              </span>
            </TableCell>

            <TableCell>
              <span
                :class="publishedClass(project.published)"
                class="px-3 py-1 rounded-full text-xs font-medium"
              >
                {{ project.published }}
              </span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
