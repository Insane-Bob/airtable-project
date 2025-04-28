<script setup lang="ts">
import { cn } from "@/lib/utils";
import { useVModel } from "@vueuse/core";
import { Eye, EyeClosed } from "lucide-vue-next";
import type { HTMLAttributes } from "vue";
import { computed, ref } from "vue";

const props = defineProps<{
  defaultValue?: string | number;
  modelValue?: string | number;
  class?: HTMLAttributes["class"];
  placeholder?: string;
  variant?: "password" | "text";
}>();

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void;
}>();

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
});

const isPasswordVisible = ref(false);

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const isPasswordVariant = computed(() => props.variant === "password");
</script>

<template>
  <div class="relative w-full">
    <input
      v-model="modelValue"
      :type="isPasswordVariant && !isPasswordVisible ? 'password' : 'text'"
      :placeholder="placeholder"
      data-slot="input"
      :class="
        cn(
          'block w-full h-9 px-3 py-1 text-base border rounded-md bg-transparent shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-input/30 dark:border-input dark:text-foreground placeholder:text-muted-foreground',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          props.class
        )
      "
    />
    <button
      v-if="isPasswordVariant"
      type="button"
      @click="togglePasswordVisibility"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400"
    >
      <Eye v-if="isPasswordVisible" class="w-5 h-5" />
      <EyeClosed v-else class="w-5 h-5" />
    </button>
  </div>
</template>

<style scoped>
input {
  padding-right: 2rem;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
</style>
