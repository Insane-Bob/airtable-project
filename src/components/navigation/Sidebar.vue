<script setup>
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { Braces, FolderOpenDot, UserRound } from "lucide-vue-next";

const items = [
  {
    title: "Projects",
    url: "/admin/projects",
    icon: FolderOpenDot,
  },
  {
    title: "Stacks",
    url: "/admin/stacks",
    icon: Braces,
  },
  {
    title: "Students",
    url: "/admin/students",
    icon: UserRound,
  }
];
</script>

<template>
  <Sidebar>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in items" :key="item.title">
              <SidebarMenuButton asChild>
                <a :href="item.url">
                  <component :is="item.icon" />
                  <span class="text-md">{{ item.title }}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <div class="flex justify-center items-center mb-6">
        <a href="/portfolios">
          <Button class="w-fit hover:cursor-pointer" variant="outline">
            See all portfolios
          </Button>
        </a>
      </div>
    </SidebarFooter>
  </Sidebar>
</template>
