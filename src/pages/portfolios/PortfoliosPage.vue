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
import { ArrowRight } from "lucide-vue-next";
import { onMounted, ref } from "vue";

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  status: "TODO" | "WIP" | "FINISHED";
  published: "PUBLISHED" | "NOT PUBLISHED";
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

onMounted(async () => {
  try {
    const records = await airtableService.getAllRecords("Projects", {
      maxRecords: 100,
      view: "All View",
    });

    for (const record of records) {
      projects.value.push({
        id: record.id,
        name: record.fields.Name,
        description: record.fields.Description || "No description available",
        technologies: record.fields.Technologies || [],
        status: record.fields.Statut,
        published: record.fields.Published,
      });
    }
  } catch (error) {
    console.error("Error fetching projects from Airtable:", error);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-12">
    <div class="container mx-auto px-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Our Student Projects</h1>
        <p class="text-gray-500 mt-2">
          Browse through the latest student projects and explore their details.
        </p>
      </div>

      <!-- Projects Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <span
                  :class="statusClass(project.status)"
                  class="px-3 py-1 rounded-full text-xs font-medium"
                >
                  {{ project.status }}
                </span>
              </div>
            </CardTitle>
            <CardDescription class="mt-2">
              <span
                :class="publishedClass(project.published)"
                class="px-3 py-1 rounded-full text-xs font-medium"
              >
                {{ project.published }}
              </span></CardDescription
            >
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
            <div class="flex items-center gap-2 w-full mt-4 group">
              <span
                class="text-gray-600 group-hover:text-blue-600 text-xs font-semibold"
              >
                See more
              </span>
              <ArrowRight
                class="text-gray-600 group-hover:text-blue-600 group-hover:translate-x-1 transition-all w-5 h-5"
              />
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.group:hover .group-hover\:translate-x-2 {
  transform: translateX(0.5rem);
}
</style>
