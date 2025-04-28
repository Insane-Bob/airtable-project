<script setup lang="ts">
import Loader from "@/components/Loader.vue";
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

interface Student {
  fullname: string;
  email: string;
  year: number;
  promotion: string;
}

const userStore = useUserStore();
const students = ref<Student[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const records = await airtableService.getAllRecords("Users", {
      maxRecords: 100,
      view: "Students View",
    });

    for (const record of records) {
      students.value.push({
        fullname: record.fields.Fullname,
        email: record.fields.Email,
        year: record.fields.Year,
        promotion: record.fields.Promotion,
      });
    }
  } catch (error) {
    console.error("Error fetching students from Airtable:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="w-full p-6">
    <h1 class="text-2xl font-semibold mb-4">All students</h1>

    <p class="text-gray-500 mb-4">Here are all the students you can manage.</p>

    <!-- Loading -->
    <Loader v-if="isLoading" />

    <!-- Table -->
    <div v-else>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Promotion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="(student, index) in students" :key="index">
            <TableCell>{{ student.fullname }}</TableCell>
            <TableCell>{{ student.email }}</TableCell>
            <TableCell>{{ student.year }}</TableCell>
            <TableCell>{{ student.promotion }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
