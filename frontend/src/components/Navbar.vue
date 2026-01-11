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
          <!-- Home Link (always visible) -->
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
          
          <!-- Admin Links (only for admins) -->
          <li 
            v-for="link in adminLinks" 
            :key="link.path"
            class="nav-item"
            v-if="isAdmin"
          >
            <router-link 
              :to="link.path" 
              class="nav-link"
              active-class="active"
            >
              <i :class="`${link.icon} mr-2`"></i>
              <span>{{'‎ ' +link.name }}</span>
            </router-link>
          </li>
        </ul>
      </div>
        <!-- Cart Button with Badge -->
        <div class="cart-container">
          <Button 
            icon="pi pi-shopping-cart"
            severity="info"
            text
            rounded
            @click="goToCart"
            class="cart-btn"
            v-tooltip="'View Cart & Requests'"
          />
          <!-- Notification Badge -->
          <span 
            v-if="cartCount > 0" 
            class="cart-badge"
            :class="{ 'pulse-animation': hasNewItems }"
          >
            {{ cartCount > 99 ? '99+' : cartCount }}
          </span>
        </div>
      <!-- User Profile Section -->
      <div class="navbar-profile">
        <!-- Admin Badge (if admin) -->
        <span v-if="isAdmin" class="admin-badge">
          <i class="pi pi-shield"></i>
          <span>Admin</span>
        </span>
        
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'

const router = useRouter()
const route = useRoute()
const toast = useToast()

// Cart state
const cartCount = ref(0)
const hasNewItems = ref(false)
const user = ref({})
const cartItems = ref([])

// Check if user is admin
const isAdmin = computed(() => {
  return user.value.role === 'admin' || user.value.isAdmin === true
})

// Admin navigation links
const adminLinks = [
  { path: '/logs', name: 'Logs', icon: 'pi pi-history' },
  { path: '/requests', name: 'Requests', icon: 'pi pi-inbox' },
  { path: '/missing', name: 'Missing Items', icon: 'pi pi-question-circle' },
  { path: '/purchace-list', name: 'Purchace List', icon: 'pi pi-list-check' },
  { path: '/admin', name: 'Admins', icon: 'pi pi-cog' },
]

// Event handler for cart updates
const handleCartUpdate = (event) => {
  
  // Don't increment if we're on the cart page
  if (route.path === '/cart') {
    return
  }
  
  // Increment cart count
  cartCount.value += 1
  
  // Save to localStorage for persistence
  localStorage.setItem('cartCount', cartCount.value.toString())
  
  // Store item details if provided
  if (event?.detail) {
    const newItem = {
      ...event.detail,
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random()
    }
    
    // Add to cart items array
    cartItems.value.push(newItem)
    localStorage.setItem('cartItems', JSON.stringify(cartItems.value))
    
    // Show notification toast with item name
    const itemName = event.detail.itemName || event.detail.model_name || 'item'
    toast.add({
      severity: 'info',
      summary: 'Request Added',
      detail: `"${itemName}" added to your requests`,
      life: 2000,
      group: 'tr'
    })
  } else {
    // Generic notification if no details provided
    toast.add({
      severity: 'info',
      summary: 'Request Added',
      detail: 'New request added to your cart',
      life: 2000,
      group: 'tr'
    })
  }
  
  // Trigger pulse animation
  hasNewItems.value = true
  setTimeout(() => {
    hasNewItems.value = false
  }, 1000)
}

// Clear cart notification
const clearCartNotification = () => {
  cartCount.value = 0
  localStorage.setItem('cartCount', '0')
  // Note: We keep cartItems in storage but clear the count
}

// Load cart data from localStorage
const loadCartData = () => {
  try {
    // Load cart count
    const savedCount = localStorage.getItem('cartCount')
    if (savedCount) {
      cartCount.value = parseInt(savedCount)
    }
    
    // Load cart items
    const savedItems = localStorage.getItem('cartItems')
    if (savedItems) {
      cartItems.value = JSON.parse(savedItems)
    }
    
  } catch (error) {
    console.error('Error loading cart data:', error)
    // Reset on error
    cartCount.value = 0
    cartItems.value = []
  }
}

// Clear entire cart (optional, for debugging)
const clearCart = () => {
  cartCount.value = 0
  cartItems.value = []
  localStorage.removeItem('cartCount')
  localStorage.removeItem('cartItems')
  toast.add({
    severity: 'info',
    summary: 'Cart Cleared',
    detail: 'All requests have been cleared',
    life: 2000
  })
}

// Go to cart page
const goToCart = () => {
  // Clear notification when going to cart
  clearCartNotification()
  router.push('/cart')
}

// Navigate to admin page
const goToAdminPage = (path) => {
  router.push(path)
}

// Watch for route changes to clear notification on cart page
watch(() => route.path, (newPath) => {
  if (newPath === '/cart') {
    clearCartNotification()
  }
})

// Get user data from localStorage
onMounted(() => {
  // Load user data
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
  
  // Load cart data
  loadCartData()
  
  // Listen for cart update events from ANYWHERE in the app
  window.addEventListener('cart-updated', handleCartUpdate)
  
  // Listen for clear-cart-notification events
  window.addEventListener('clear-cart-notification', clearCartNotification)
  
  
  // Check if we're already on cart page on mount
  if (route.path === '/cart') {
    clearCartNotification()
  }
  
  // For debugging: expose clearCart function globally
  window.clearCartDebug = clearCart
})

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('cart-updated', handleCartUpdate)
  window.removeEventListener('clear-cart-notification', clearCartNotification)
  delete window.clearCartDebug
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
// In your NavBar component
// /components/NavBar.vue
// /components/NavBar.vue
const logout = async () => {
  try {
    // 1. Set session flag to indicate we're logging out
    sessionStorage.setItem('from_logout', 'true')
    sessionStorage.setItem('force_magic_logout', 'true')
    
    // 2. Try to logout from Magic
    if (window.magic) {
      try {
        await window.magic.user.logout()
        console.log('Logged out from Magic SDK')
      } catch (magicError) {
        console.error('Magic logout error:', magicError)
      }
    }
    
    // 3. Clear ALL storage more aggressively
    const allKeys = Object.keys(localStorage)
    allKeys.forEach(key => {
      // Keep only non-Magic, non-app keys (optional)
      if (!key.startsWith('__magic') && 
          !key.startsWith('magic_') && 
          key !== 'token' && 
          key !== 'user') {
        // Keep other keys if needed
      } else {
        localStorage.removeItem(key)
      }
    })
    
    // Clear token and user
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // 4. Clear sessionStorage except our logout flag
    const sessionKeys = Object.keys(sessionStorage).filter(key => 
      !key.includes('logout') && !key.includes('magic')
    )
    sessionKeys.forEach(key => sessionStorage.removeItem(key))
    
    toast.add({
      severity: 'success',
      summary: 'Logged out',
      detail: 'You have been logged out successfully',
      life: 2000
    })
    
    // 5. Force page reload to completely clear Magic state
    setTimeout(() => {
      window.location.href = '/login'
    }, 500)
    
  } catch (error) {
    console.error('Logout error:', error)
    toast.add({
      severity: 'error',
      summary: 'Logout Failed',
      detail: 'There was an error logging out',
      life: 3000
    })
  }
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

/* Cart Button with Badge */
.cart-container {
  position: relative;
  display: inline-block;
}

.cart-btn {
  padding: 0.5rem;
  transition: all 0.2s ease;
}

.cart-btn:hover {
  background-color: #f0f9ff !important;
  color: #0284c7 !important;
}

/* Cart Notification Badge */
.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ef4444;
  color: white;
  border-radius: 9999px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0 4px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

/* Pulse Animation for New Items */
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    transform: scale(1.2);
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.pulse-animation {
  animation: pulse 1s ease-in-out;
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