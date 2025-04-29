<script setup lang="ts">
import { ref } from 'vue';
import { Heart } from "lucide-vue-next";
import { airtableService } from '@/services/airtableService';
import { useUserStore } from '@/stores/userStore';

interface Props {
  projectId: string;
  likes: number;
  initialLiked: boolean;
  initialLikes: number;
  projectName: string;
  onUpdateLike?: (liked: boolean) => void;
}

interface EmitType {
  (e: 'showAlert', data: { type: 'success' | 'error' | 'info', title: string, message: string }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<EmitType>();

const userStore = useUserStore();
const isAnimating = ref(false);
const isLiked = ref(props.initialLiked);
const likes = ref(props.initialLikes);

const toggleLike = async () => {
  const isLoggedIn = userStore.getAuthStatus;

  if (!isLoggedIn) {
    emit('showAlert', {
      type: 'info',
      title: 'Authentication required',
      message: 'You need to be logged in to like projects'
    });
    return;
  }

  isAnimating.value = true;

  try {
    const userRecord = await airtableService.getRecordById("Users", userStore.user.id);
    const userLikedProjects = userRecord?.fields["Liked projects"] || [];

    const projectRecord = await airtableService.getRecordById("Projects", props.projectId);
    const projectUsersLikes = projectRecord?.fields["Users likes"] || [];

    const currentlyLiked = userLikedProjects.includes(props.projectId);

    if (currentlyLiked) {
      const updatedUserLikes = userLikedProjects.filter((id: string) => id !== props.projectId);
      const updatedProjectLikes = projectUsersLikes.filter((id: string) => id !== userStore.user.id);

      await airtableService.updateRecord("Users", userStore.user.id, {
        "Liked projects": updatedUserLikes
      });

      await airtableService.updateRecord("Projects", props.projectId, {
        "Users likes": updatedProjectLikes
      });

      isLiked.value = false;
      likes.value--;

      emit('showAlert', {
        type: 'success',
        title: 'Like removed',
        message: `You no longer like "${props.projectName}"`
      });
    } else {
      const updatedUserLikes = [...userLikedProjects, props.projectId];
      const updatedProjectLikes = [...projectUsersLikes, userStore.user.id];

      await airtableService.updateRecord("Users", userStore.user.id, {
        "Liked projects": updatedUserLikes
      });

      await airtableService.updateRecord("Projects", props.projectId, {
        "Users likes": updatedProjectLikes
      });

      isLiked.value = true;
      likes.value++;

      emit('showAlert', {
        type: 'success',
        title: 'Project liked!',
        message: `You liked "${props.projectName}"`
      });
    }

    if (props.onUpdateLike) {
      props.onUpdateLike(isLiked.value);
    }

    setTimeout(() => {
      isAnimating.value = false;
    }, 600);

  } catch (error) {
    console.error("Error updating like status:", error);
    emit('showAlert', {
      type: 'error',
      title: 'Error',
      message: "An error occurred while updating the like"
    });
    isAnimating.value = false;
  }
};
</script>

<template>
  <button
      @click="toggleLike"
      class="flex items-center gap-2 transition duration-200"
  >
    <Heart
        :class="[
        isLiked ? 'stroke-1 stroke-gray-800 text-pink-600 fill-pink-600' : 'stroke-1 stroke-gray-800 text-gray-400 fill-gray-400',
        isAnimating ? 'animate-heart-bounce' : ''
      ]"
    />
  </button>
</template>

<style scoped>
@keyframes heartBounce {
  0%, 100% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.4);
  }
  60% {
    transform: scale(0.8);
  }
  80% {
    transform: scale(1.2);
  }
}

.animate-heart-bounce {
  animation: heartBounce 0.6s ease;
}
</style>