// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { useUserStore } from '@/stores/userStore.js';
import router from './router';
import './index.css';

const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(pinia);

const userStore = useUserStore();
if (userStore.getAuthStatus) {  
  console.log("User is authenticated!");
} else {
  console.log("User is not authenticated.");
}

app.mount('#app');
