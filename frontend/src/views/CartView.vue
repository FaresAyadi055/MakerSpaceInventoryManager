<template>
  <div>
    <Navbar />
    <div class="cart-view">
      <div class="container mx-auto px-4 py-6">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-surface-900 mb-2">My Requests</h1>
          <br/>
          <p class="text-surface-600">View all your submitted requests</p>
          <br/>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center h-64">
          <i class="pi pi-spin pi-spinner text-4xl text-primary-600"></i>
        </div>

        <!-- Content -->
        <div v-else class="flex flex-col lg:flex-row gap-6">
          <!-- Main Content - Requests List -->
          <div class="lg:w-2/3">
            <!-- Tabs for filtering -->
             <div class = "filter-buttons">
            <div class="mb-6 flex justify-between gap-2 border-b">
              <Button 
                v-for="tab in tabs" 
                :key="tab.id"
                @click="activeTab = tab.id"
                :text="activeTab !== tab.id"
                :outlined="activeTab !== tab.id"
                class="flex-1"
                :severity="activeTab === tab.id ? 'primary' : 'secondary'"
              >
                {{ tab.label }} ({{ getRequestCount(tab.id) }})
              </Button>
            </div>
             </div>
            <br/>
            <!-- No Requests Message -->
            <div v-if="filteredRequests.length === 0" class="text-center py-12">
              <i class="pi pi-inbox text-6xl text-surface-300 mb-4"></i>
              <h3 class="text-xl font-semibold text-surface-700 mb-2">No Requests Found</h3>
              <p class="text-surface-500">You haven't submitted any requests yet.</p>
            </div>

            <!-- Requests Container -->
            <div 
              v-else 
              class="requests-container"
              :class="filteredRequests.length > 5 ? 'max-h-[70vh]' : ''"
            >
              <!-- Request Cards -->
              <div 
                v-for="request in filteredRequests" 
                :key="`${request.type}-${request.id}`"
                class="request-card"
                :class="getRequestTypeClass(request.type)"
              >
                <!-- Card Header -->
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <i :class="getRequestIcon(request.type)" class="text-lg"></i>
                      <span class="font-semibold text-surface-900">
                        {{ request.type === 'available' || request.type === 'log' ? ' Available Item Request ' : ' Unavailable Item Request ' }}
                      </span>
                      <Badge 
                        :value="request.status || 'pending'" 
                        :severity="getStatusSeverity(request.status)"
                        class="ml-2"
                      />
                    </div>
                  </div>
                </div>

                <!-- Request Details -->
                <div class="space-y-2">
                  <div v-if="request.type === 'available' || request.type === 'log'">
                    <div class="flex items-center justify-between">
                      <span class="text-surface-600">Model ID:</span>
                      <span class="font-medium">{{`${request.model_id}` }}</span>
                    </div>
                      <div class="flex items-center justify-between">
                      <span class="text-surface-600">Model:</span>
                      <span class="font-medium">{{` ${request.model}` }}</span>
                    </div>
                  </div>
                  <div v-else>
                    <div class="flex items-center justify-between">
                      <span class="text-surface-600">Model:</span>
                      <span class="font-medium">{{ request.model}}</span>
                    </div>
                    <div v-if="request.description" class="flex items-center justify-between">
                      <span class="text-surface-600">Link:</span>
                      <span class="font-medium text-right"><a :href="request.description" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium">{{request.model || 'View Link' }} <i class="pi pi-external-link ml-1 text-xs"></i></a></span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-surface-600">Quantity:</span>
                    <Badge :value="request.quantity" severity="info" />
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-surface-600">Class:</span>
                    <span class="font-medium">{{ request.class }}</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-surface-600">Submitted:</span>
                    <span class="font-medium">{{ formatDate(request.timestamp) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar - Summary -->
          <div class="lg:w-1/3">
            <div class="card sticky top-6">
              <div class="p-4 border-b">
                <h3 class="font-semibold text-surface-900">Request Summary</h3>
              </div>
              
              <div class="p-4 space-y-4">
                <!-- Summary Stats -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-surface-600">Total Requests:</span>
                    <span class="font-semibold">{{ totalRequests }}</span>
                  </div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-surface-600">Available Items:</span>
                    <span class="font-semibold text-green-600">{{ availableRequests.length }}</span>
                  </div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-surface-600">Unavailable Items:</span>
                    <span class="font-semibold text-orange-600">{{ missingRequests.length }}</span>
                  </div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-surface-600">Approved Items:</span>
                    <span class="font-semibold text-blue-600">{{ logRequests.length }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog 
      v-model:visible="showDeleteDialog" 
      :style="{ width: '450px' }" 
      header="Delete Request"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: #ef4444;"></i>
        <span>Are you sure you want to delete this request? This action cannot be undone.</span>
      </div>
      
      <template #footer>
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          @click="showDeleteDialog = false" 
          class="p-button-text"
          severity="secondary"
        />
        <Button 
          label="Delete" 
          icon="pi pi-trash" 
          @click="confirmDelete"
          autofocus
          :loading="deletingRequest"
          severity="danger"
        />
      </template>
    </Dialog>

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Badge from 'primevue/badge'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()
const toast = useToast()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// State
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const loading = ref(false)
const availableRequests = ref([])
const missingRequests = ref([])
const logRequests = ref([]) // New state for approved requests from logs
const activeTab = ref('all')
const requestToDelete = ref(null)
const showDeleteDialog = ref(false)
const deletingRequest = ref(false)

// Tabs
const tabs = [
  { id: 'all', label: 'All Requests' },
  { id: 'available', label: 'Available Items' },
  { id: 'missing', label: 'Unavailable Items' },
  { id: 'approved', label: 'Approved Items' } // New tab for approved requests
]

// Computed properties
const userEmail = computed(() => user.value?.email || '')
const totalRequests = computed(() => availableRequests.value.length + missingRequests.value.length + logRequests.value.length)

// All requests combined and sorted by timestamp (newest first)
const allRequests = computed(() => {
  const available = availableRequests.value.map(req => ({
    ...req,
    type: 'available',
    id: req.id,
    timestamp: req.timestamp
  }))
  
  const missing = missingRequests.value.map(req => ({
    ...req,
    type: 'missing',
    id: req.id,
    timestamp: req.timestamp
  }))
  
  // Add log requests with type 'log' and ensure they have approved status
  const logs = logRequests.value.map(req => ({
    ...req,
    type: 'log',
    id: req.id,
    timestamp: req.timestamp,
    status: 'approved' // Force status to approved for log requests
  }))
  
  // Combine and sort by timestamp (newest first)
  return [...available, ...missing, ...logs].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  )
})

// Filtered requests based on active tab
const filteredRequests = computed(() => {
  switch (activeTab.value) {
    case 'available':
      return allRequests.value.filter(req => req.type === 'available')
    case 'missing':
      return allRequests.value.filter(req => req.type === 'missing')
    case 'approved':
      return allRequests.value.filter(req => req.type === 'log')
    default:
      return allRequests.value
  }
})

// Load requests
const loadRequests = async () => {
  loading.value = true
  try {
    // Load available requests
    const availableResponse = await fetch(`${apiUrl}/requests/student_req/${encodeURIComponent(userEmail.value)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (availableResponse.ok) {
      const availableData = await availableResponse.json()
      if (availableData.success) {
        availableRequests.value = availableData.data || []
        // Model names are now included directly from the API via SQL JOIN
      }
    }
    
    // Load missing requests
    const missingResponse = await fetch(`${apiUrl}/missing/student_mis/${encodeURIComponent(userEmail.value)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (missingResponse.ok) {
      const missingData = await missingResponse.json()
      if (missingData.success) {
        missingRequests.value = missingData.data || []
      }
    }
    
    // Load approved requests from logs
    const logsResponse = await fetch(`${apiUrl}/logs/student/${encodeURIComponent(userEmail.value)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (logsResponse.ok) {
      const logsData = await logsResponse.json()
      if (logsData.success) {
        logRequests.value = logsData.data || []
      }
    }
    
    toast.add({
      severity: 'success',
      summary: 'Requests Loaded',
      detail: `Loaded ${totalRequests.value} requests`,
      life: 3000
    })
    
  } catch (error) {
    console.error('Error loading requests:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load requests',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

// Helper functions
const getRequestCount = (tabId) => {
  switch (tabId) {
    case 'available': return availableRequests.value.length
    case 'missing': return missingRequests.value.length
    case 'approved': return logRequests.value.length
    default: return totalRequests.value
  }
}

const getRequestTypeClass = (type) => {
  if (type === 'available') {
    return 'border-l-4 border-green-500'
  } else if (type === 'missing') {
    return 'border-l-4 border-orange-500'
  } else {
    return 'border-l-4 border-blue-500' // For log/approved requests
  }
}

const getRequestIcon = (type) => {
  if (type === 'available') {
    return 'pi pi-check-circle text-green-500'
  } else if (type === 'missing') {
    return 'pi pi-question-circle text-orange-500'
  } else {
    return 'pi pi-check-circle text-blue-500' // For log/approved requests
  }
}

const getStatusSeverity = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved': return 'success'
    case 'pending': return 'warning'
    case 'rejected': return 'danger'
    case 'fulfilled': return 'info'
    default: return null
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const confirmDelete = async () => {
  if (!requestToDelete.value) return
  
  deletingRequest.value = true
  try {
    const endpoint = requestToDelete.value.type === 'available' 
      ? '/requests' 
      : '/missing'
    
    // Note: Log requests might not support deletion, so we only handle available and missing
    if (requestToDelete.value.type === 'log') {
      toast.add({
        severity: 'info',
        summary: 'Cannot Delete',
        detail: 'Approved requests cannot be deleted from logs',
        life: 3000
      })
      return
    }
    
    const response = await fetch(`${apiUrl}${endpoint}/${requestToDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (response.ok) {
      toast.add({
        severity: 'success',
        summary: 'Request Deleted',
        detail: 'Your request has been deleted successfully',
        life: 3000
      })
      
      // Remove from local state
      if (requestToDelete.value.type === 'available') {
        availableRequests.value = availableRequests.value.filter(
          req => req.id !== requestToDelete.value.id
        )
      } else if (requestToDelete.value.type === 'missing') {
        missingRequests.value = missingRequests.value.filter(
          req => req.id !== requestToDelete.value.id
        )
      }
    } else {
      throw new Error('Failed to delete request')
    }
  } catch (error) {
    console.error('Error deleting request:', error)
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: 'Failed to delete request',
      life: 5000
    })
  } finally {
    deletingRequest.value = false
    showDeleteDialog.value = false
    requestToDelete.value = null
  }
}

// Lifecycle
onMounted(() => {
  loadRequests()
  
  // Clear cart notification
  window.dispatchEvent(new CustomEvent('clear-cart-notification'))
  localStorage.setItem('cartCount', '0')
  
  // Listen for cart updates to refresh requests
  window.addEventListener('cart-updated', loadRequests)
})

// Cleanup
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('cart-updated', loadRequests)
})
</script>

<style scoped>
.cart-view {
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden; /* Prevent horizontal scroll */
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  box-sizing: border-box; /* Include padding in width calculation */
}

/* Container to prevent any horizontal overflow */
.cart-view > * {
  max-width: 100%;
  overflow-x: hidden;
}

.requests-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  padding-right: 0.5rem;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%; /* Prevent overflow */
}

.request-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%; /* Prevent overflow */
  overflow: hidden; /* Contain any overflowing content */
}

.request-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.confirmation-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  max-width: 100%;
}

/* Force all content inside request cards to wrap */
.request-card * {
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Scrollbar styling */
.requests-container::-webkit-scrollbar {
  width: 6px;
}

.requests-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.requests-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.requests-container::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* FIXED: Filter buttons - properly responsive */
.filter-buttons {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem; /* Reduced gap for mobile */
  width: 100%;
  flex-wrap: nowrap; /* Keep buttons in a row */
  overflow-x: auto; /* Allow horizontal scroll for buttons if needed */
  padding-bottom: 0.5rem; /* Space for scrollbar */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

/* Individual button styling */
.filter-buttons button,
.filter-buttons .p-button {
  flex: 1; /* Make buttons take equal space */
  min-width: 0; /* Allow buttons to shrink */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.85rem; /* Smaller font on mobile */
  padding: 0.5rem 0.75rem;
}

/* Hide scrollbar for buttons when not scrolling */
.filter-buttons::-webkit-scrollbar {
  height: 3px;
}

.filter-buttons::-webkit-scrollbar-track {
  background: transparent;
}

.filter-buttons::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

/* Responsive design */
@media (max-width: 768px) {
  .cart-view {
    width: 100vw;
    max-width: 100vw;
    padding: 0;
    margin: 0;
    position: relative;
    left: 0;
    right: 0;
  }
  
  /* Nuclear option to kill horizontal scroll */
  body, html {
    max-width: 100vw;
    overflow-x: hidden;
  }
  
  .requests-container {
    max-height: 60vh;
    width: 100vw;
    max-width: 100vw;
    padding: 0 0.75rem 0.5rem 0.75rem;
    margin: 0;
    overflow-x: hidden; /* Prevent horizontal scroll in container */
  }
  
  .request-card {
    padding: 0.75rem;
    width: 100%;
    margin: 0;
    border-radius: 0.375rem;
  }
  
  /* FIXED: Button layout for mobile */
  .filter-buttons {
    display: grid !important; /* Use grid for better control */
    grid-template-columns: repeat(4, 1fr); /* 4 equal columns for 4 tabs */
    gap: 0.375rem; /* Smaller gap */
    padding: 0 0.75rem 0.75rem 0.75rem;
    overflow-x: visible; /* No scroll needed with grid */
    flex-wrap: nowrap;
  }
  
  .filter-buttons button,
  .filter-buttons .p-button {
    width: 100%;
    min-width: 0;
    padding: 0.375rem 0.5rem;
    font-size: 0.8rem;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* Ensure all content fits */
  .cart-view > * {
    width: 100vw !important;
    max-width: 100vw !important;
    box-sizing: border-box;
    padding-left: 0.75rem !important;
    padding-right: 0.75rem !important;
  }
  
  /* Fix any PrimeVue components */
  :deep(.p-button) {
    max-width: 100%;
  }
  
  :deep(.p-element) {
    max-width: 100%;
  }
}

/* Extra small devices (very narrow phones) */
@media (max-width: 480px) {
  .request-card {
    padding: 0.5rem;
  }
  
  .requests-container {
    padding: 0 0.5rem 0.5rem 0.5rem;
  }
  
  /* Adjust buttons for very small screens */
  .filter-buttons {
    grid-template-columns: 1fr 1fr; /* 2 columns on very small screens */
    gap: 0.25rem;
    padding: 0 0.5rem 0.5rem 0.5rem;
  }
  
  .filter-buttons button,
  .filter-buttons .p-button {
    width: 100%;
    padding: 0.5rem;
    font-size: 0.75rem;
  }
}

/* Small tablets */
@media (min-width: 481px) and (max-width: 768px) {
  .filter-buttons {
    gap: 0.5rem;
    padding: 0 1rem 1rem 1rem;
  }
  
  .filter-buttons button,
  .filter-buttons .p-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
}
</style>