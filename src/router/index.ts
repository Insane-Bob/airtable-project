import AppLayout from '@/layouts/AppLayout.vue';
import LoginPage from '@/pages/authentication/LoginPage.vue';
import RegisterPage from '@/pages/authentication/RegisterPage.vue';
import ProjectsPage from '@/pages/projects/ProjectsPage.vue';
import PortfoliosPage from '@/pages/portfolios/PortfoliosPage.vue';
import StacksPage from '@/pages/stacks/StacksPage.vue';
import StudentsPage from '@/pages/students/StudentsPage.vue';
import { useUserStore } from '@/stores/userStore.js';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '/projects',
          name: 'Projects',
          component: ProjectsPage,
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: '/stacks',
          name: 'Stacks',
          component: StacksPage,
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: '/students',
          name: 'Students',
          component: StudentsPage,
          meta: { requiresAuth: true, requiresAdmin: true },
        }
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterPage,
    },
    {
      path: '/portfolios',
      name: "Portfolios",
      component: PortfoliosPage,
      meta: { requiresAuth: false, requiresAdmin: false }
    },
  ],
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const user = userStore.user;
  const isAuthenticated = !!user;
  const isAdmin = user?.roles === "Admin";

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;
