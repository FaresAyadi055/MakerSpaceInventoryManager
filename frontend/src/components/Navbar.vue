<!-- src/components/Navbar.vue -->
<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo/Brand -->
      <div class="navbar-brand">
        <router-link to="/home" class="logo-link">
          <i class="pi pi-box navbar-logo"></i>
          <span class="brand-name">MakerSpace</span>
          <span class="brand-subtitle">Inventory</span>
        </router-link>
      </div>

      <!-- Navigation Links -->
      <div class="navbar-menu">
        <ul class="nav-links">
          <li class="nav-item">
            <router-link 
              to="/home" 
              class="nav-link"
              active-class="active"
            >
              <i class="pi pi-list-check mr-2"></i>
              <span>Inventory</span>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- User Profile Section -->
      <div class="navbar-profile">
        <div class="user-info">
          <Avatar 
            :label="userInitial"
            shape="circle"
            class="user-avatar"
          />
          <div class="user-details">
            <span class="user-name">{{ userName }}</span>
            <span class="user-email">{{ userEmail }}</span>
          </div>
        </div>
        <Button
          icon="pi pi-sign-out"
          severity="secondary"
          text
          rounded
          @click="logout"
          class="logout-btn"
          v-tooltip="'Logout'"
        />
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'

const router = useRouter()
const toast = useToast()

// User data
const user = ref({})

// Get user data from localStorage
onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
})

// Computed properties
const userInitial = computed(() => {
  return user.value.name?.[0]?.toUpperCase() || user.value.email?.[0]?.toUpperCase() || 'U'
})

const userName = computed(() => {
  return user.value.name || 'User'
})

const userEmail = computed(() => {
  return user.value.email || 'user@example.com'
})

// Logout function
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  
  toast.add({
    severity: 'success',
    summary: 'Logged out',
    detail: 'You have been logged out successfully',
    life: 2000
  })
  
  setTimeout(() => {
    router.push('/login')
  }, 500)
}
</script>

<style scoped>
.navbar {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 0 1.5rem;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  max-width: 100%;
  margin: 0 auto;
}

/* Brand/Logo Styles */
.navbar-brand {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.logo-link:hover {
  background-color: #f9fafb;
}

.navbar-logo {
  font-size: 1.75rem;
  color: #3b82f6;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.025em;
}

.brand-subtitle {
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  margin-left: 0.25rem;
}

/* Navigation Menu */
.navbar-menu {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1rem;
}

.nav-item {
  display: flex;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 1.25rem;
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.nav-link:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.nav-link.active {
  background-color: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
}

.nav-link.active i {
  color: #3b82f6;
}

/* User Profile Section */
.navbar-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.user-info:hover {
  background-color: #f9fafb;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-weight: 600;
  cursor: pointer;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.25;
}

.user-email {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.25;
}

.logout-btn {
  padding: 0.5rem;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: #fef2f2 !important;
  color: #dc2626 !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .navbar {
    padding: 0 1rem;
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .nav-link span {
    font-size: 0.875rem;
  }
  
  .user-name {
    display: none;
  }
  
  .user-email {
    display: none;
  }
}
</style>