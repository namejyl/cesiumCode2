import { createRouter, createWebHistory } from 'vue-router';
import Menu from '../layout/Menu.vue';
// 公共路由
export const constantRoutes = [
  {
    path: '/',
    name: 'index',
    component: Menu
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
});
router.beforeEach(async (to, form, next) => {
  next();
});
export default router;
