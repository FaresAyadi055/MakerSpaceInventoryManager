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
                        {{ request.type === 'available' ? ' Available Item Request ' : ' Unavailable Item Request ' }}
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
                  <div v-if="request.type === 'available'">
                    <div class="flex items-center justify-between">
                      <span class="text-surface-600">Model ID:</span>
                      <span class="font-medium">{{`${request.id}` }}</span>
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
                      <span class="text-surface-600">Description:</span>
                      <span class="font-medium text-right">{{ request.description }}</span>
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
const activeTab = ref('all')
const requestToDelete = ref(null)
const showDeleteDialog = ref(false)
const deletingRequest = ref(false)

// Tabs
const tabs = [
  { id: 'all', label: 'All Requests' },
  { id: 'available', label: 'Available Items' },
  { id: 'missing', label: 'Unavailable Items' }
]

// Computed properties
const userEmail = computed(() => user.value?.email || '')
const totalRequests = computed(() => availableRequests.value.length + missingRequests.value.length)

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
  
  // Combine and sort by timestamp (newest first)
  return [...available, ...missing].sort((a, b) => 
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
    default: return totalRequests.value
  }
}

const getRequestTypeClass = (type) => {
  return type === 'available' 
    ? 'border-l-4 border-green-500' 
    : 'border-l-4 border-orange-500'
}

const getRequestIcon = (type) => {
  return type === 'available' 
    ? 'pi pi-check-circle text-green-500' 
    : 'pi pi-question-circle text-orange-500'
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
      } else {
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.requests-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.request-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
  position: relative;
}

.request-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.confirmation-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
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

/* Responsive design */
@media (max-width: 768px) {
  .requests-container {
    max-height: 60vh;
  }
  
  .request-card {
    padding: 1rem;
  }
  
}
.filter-buttons{
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
</style>