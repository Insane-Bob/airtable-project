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
import { airtableService } from "@/services/airtableService";
import { onMounted, ref, watch } from "vue";
import { Search } from "lucide-vue-next";

interface Language {
  id: string;
  logo: string;
  name: string;
  type: string;
  documentation: string;
  description: string;
  published: string;
  projects: string[];
}

const languages = ref<Language[]>([]);
const isLoading = ref(true);
const selectedType = ref("All View");
const filteredLanguages = ref<Language[]>([]);
const searchQuery = ref("");
const isSearching = ref(false);

const filterLanguagesByType = (view: string) => {
  selectedType.value = view;
  applyFilters();
};

const searchLanguages = async () => {
  if (!searchQuery.value.trim()) {
    applyFilters();
    return;
  }

  isSearching.value = true;

  try {
    const formula = `FIND(LOWER("${searchQuery.value}"), LOWER({Name}))`

    const records = await airtableService.getAllRecords("Languages", {
      maxRecords: 100,
      filterByFormula: formula,
    });

    const searchResults: Language[] = [];

    for (const record of records) {
      searchResults.push({
        id: record.id,
        logo: record.fields.Logo,
        name: record.fields.Name,
        type: record.fields.Type,
        description: record.fields.Description || "No description available",
        documentation: record.fields.Documentation,
        published: record.fields.Published,
        projects: record.fields.ProjectNames || [],
      });
    }

    filteredLanguages.value = searchResults;

    if (selectedType.value !== "All View") {
      filteredLanguages.value = filteredLanguages.value.filter(
          (language) => language.type === selectedType.value
      );
    }
  } catch (error) {
    console.error("Error searching languages from Airtable:", error);
  } finally {
    isSearching.value = false;
  }
};

const applyFilters = () => {
  if (searchQuery.value.trim()) {
    searchLanguages();
    return;
  }

  switch (selectedType.value) {
    case "Database":
    case "Framework":
    case "Library":
    case "Server":
    case "Language":
      filteredLanguages.value = languages.value.filter(
          (language) => language.type === selectedType.value
      );
      break;
    default:
      filteredLanguages.value = [...languages.value];
  }
};

let searchTimeout: number | null = null;
watch(searchQuery, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    searchLanguages();
  }, 500) as unknown as number;
});

const clearSearch = () => {
  searchQuery.value = "";
  applyFilters();
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
        logo: record.fields.Logo,
        name: record.fields.Name,
        type: record.fields.Type,
        description: record.fields.Description || "No description available",
        documentation: record.fields.Documentation,
        published: record.fields.Published,
        projects: record.fields.ProjectNames || [],
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
      <div class="mb-6 flex flex-col md:flex-row gap-4">
        <div class="relative flex-1">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                  v-model="searchQuery"
                  placeholder="Searching for a stack..."
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
            <Button
                @click="searchLanguages"
                :disabled="isSearching"
            >
              {{ isSearching ? "Search in progress..." : "Search" }}
            </Button>
          </div>
        </div>

        <!-- Filter by Type -->
        <Select
            v-model="selectedType"
            @update:modelValue="filterLanguagesByType"
            class="md:w-48"
        >
          <SelectTrigger>
            <SelectValue :placeholder="selectedType" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="All View">All</SelectItem>
              <SelectItem value="Library">Library</SelectItem>
              <SelectItem value="Server">Server</SelectItem>
              <SelectItem value="Framework">Framework</SelectItem>
              <SelectItem value="Language">Language</SelectItem>
              <SelectItem value="Database">Database</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div v-if="filteredLanguages.length === 0" class="text-center py-8">
        <p class="text-gray-500">
          No stacks found for the selected type or search query.
        </p>
      </div>

      <!-- Table -->
      <Table v-else>
        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Projects</TableHead>
          </TableRow>
        </TableHeader>
        <!-- Table -->
        <TableBody>
          <TableRow v-for="(language, index) in filteredLanguages" :key="index">
            <TableCell>
              <div v-if="language.logo && language.logo.length" class="flex flex-col justify-center">
                <img
                    :src="language.logo[0].url"
                    alt="Logo"
                    class="w-8 h-8 object-fill"
                />
              </div>
              <span v-else>N/A</span>
            </TableCell>
            <TableCell>
              <a
                  :href="language.documentation"
                  target="_blank"
                  class="text-blue-500 hover:underline"
              >{{ language.name }}</a>
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