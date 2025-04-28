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
import { useUserStore } from "@/stores/userStore";
import { onMounted, ref } from "vue";

interface Language {
  logo: string;
  name: string;
  type: string;
  documentation: string;
  projects: string[];
}

const userStore = useUserStore();
const languages = ref<Language[]>([]);
const isLoading = ref(true);
const selectedType = ref("All View");
const filteredLanguages = ref<Language[]>([]);

const filterLanguagesByType = (view: string) => {
  selectedType.value = view;

  switch (view) {
    case "Database":
      filteredLanguages.value = languages.value.filter(
        (language) => language.type === "Database"
      );
      break;
    case "Framework":
      filteredLanguages.value = languages.value.filter(
        (language) => language.type === "Framework"
      );
      break;
    case "Library":
      filteredLanguages.value = languages.value.filter(
        (language) => language.type === "Library"
      );
      break;
    case "Server":
      filteredLanguages.value = languages.value.filter(
        (language) => language.type === "Server"
      );
      break;
    default:
      filteredLanguages.value = [...languages.value];
  }
};

onMounted(async () => {
  try {
    const records = await airtableService.getAllRecords("Languages", {
      maxRecords: 100,
      view: "All View",
    });

    for (const record of records) {
      languages.value.push({
        id: record.id,
        name: record.fields.Name,
        type: record.fields.Type,
        description: record.fields.Description || "No description available",
        published: record.fields.Published,
        projects: record.fields.ProjectNames,
      });
    }
    filteredLanguages.value = [...languages.value];
  } catch (error) {
    console.error("Error fetching languages from Airtable:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="w-full p-6">
    <h1 class="text-2xl font-semibold mb-4">Available Stacks</h1>

    <p class="text-gray-500 mb-4">
      Here are all the stacks from student's projects.
    </p>

    <!-- Loading -->
    <Loader v-if="isLoading" />

    <!-- Table -->
    <div v-else>
      <div class="mb-4 flex gap-4">
        <!-- Filter by Published View -->
        <Select
          v-model="selectedType"
          @update:modelValue="filterLanguagesByType"
        >
          <SelectTrigger class="w-48">
            <SelectValue :placeholder="selectedType" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Library">Library</SelectItem>
              <SelectItem value="Server">Server</SelectItem>
              <SelectItem value="Framework">Framework</SelectItem>
              <SelectItem value="Language">Language</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <!-- Table -->
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Projects</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="(language, index) in languages" :key="index">
            <TableCell>
              <img
                v-if="language.logo"
                :src="language.logo"
                loading="lazy"
                alt="Logo"
                class="w-8 h-8 object-cover"
              />
              <span v-else> N/A </span>
            </TableCell>

            <TableCell>
              <a
                :href="language.documentation"
                target="_blank"
                class="text-blue-500 hover:underline"
                >{{ language.name }}</a
              >
            </TableCell>

            <TableCell>
              <span
                class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm"
              >
                {{ language.type }}
              </span>
            </TableCell>

            <TableCell>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(project, idx) in language.projects"
                  :key="idx"
                  class="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs"
                >
                  {{ project }}
                </span>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
