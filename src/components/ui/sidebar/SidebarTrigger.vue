<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CornerDownLeft } from 'lucide-vue-next'
import { useSidebar } from './utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const { toggleSidebar } = useSidebar()
</script>

<template>
  <Button
    data-sidebar="trigger"
    data-slot="sidebar-trigger"
    variant="ghost"
    size="icon"
    :class="cn('h-5 w-5', props.class)"
    @click="toggleSidebar"
  >
    <CornerDownLeft />
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
