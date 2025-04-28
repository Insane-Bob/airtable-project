<script setup>
import { FolderOpenDot, Calendar, Home, Inbox, Search, Settings, Braces } from "lucide-vue-next"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Projects",
    url: "/projects",
    icon: FolderOpenDot,
  },
  {
    title: "Stacks",
    url: "/stacks",
    icon: Braces,
  }
];
</script>

<template>
  
</template>