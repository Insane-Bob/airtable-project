<script setup lang="ts">
import Sidebar from "@/components/navigation/Sidebar.vue";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
</script>

<template>
  <SidebarProvider>
    <Sidebar />
    <main class="flex flex-col flex-1">
      <SidebarTrigger />

      <div
        class="flex items-center justify-between w-max-screen p-4"
      >
        <router-view></router-view>
      </div>
    </main>
  </SidebarProvider>
</template>
