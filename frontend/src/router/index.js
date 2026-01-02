// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import CartView from '@/views/CartView.vue'
import AdminView from '@/views/AdminsView.vue'
import RequestsView from '@/views/RequestsView.vue'
import MissingView from '@/views/MissingView.vue'
import LogsView from '@/views/LogsView.vue'
import PurchaseListView from '@/views/PurchaseListView.vue'
const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {path: '/cart',
    name: 'cart',
    component: CartView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { requiresAuth: true }
  },
  {
    path: '/requests',
    name: 'requests',
    component: RequestsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/logs',
    name: 'logs',
    component: LogsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/purchace-list',
    name: 'purchaceList',
    component: PurchaseListView,
    meta: { requiresAuth: true }
  },
  {
    path: '/missing',
    name: 'missing',
    component: MissingView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.requiresGuest && token) {
    next('/home')
  } else {
    next()
  }
})

export default router