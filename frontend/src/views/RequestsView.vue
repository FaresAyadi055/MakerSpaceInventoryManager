<!-- src/views/RequestsView.vue -->
<template>
  <div class="requests-view">
    <Navbar />
    
    <div class="main-container">
      <div class="content-wrapper">
        <!-- Header -->
        <div class="header-section">
          <div>
            <h1 class="text-3xl font-bold text-surface-900">
              Requests Management
            </h1>
            <br />
            <p class="text-surface-600 mt-2">
              Manage all item requests from students
            </p>
          </div>
          <br />
          <div class="flex items-center gap-4">
          </div>
        </div>

        <!-- Search and Tools -->
        <div class="card mb-6">
          <div class="flex justify-between items-left p-4">
            <div class="flex items-center gap-4 w-full">
              <span class="p-input-icon-left w-full md:w-96">
                <i class="pi pi-search" />
                <InputText 
                  v-model="searchQuery" 
                  placeholder="Search across all columns..." 
                  class="w-full"
                  @input="handleSearch"
                />
              </span>
            </div>
            <br>
            <div class="flex items-center gap-2">
              <Button 
                label="Refresh" 
                icon="pi pi-refresh" 
                @click="loadData"
                :loading="loading"
              />
              <Button 
                label="Export CSV"
                icon="pi pi-file-export" 
                class="ml-4"
                @click="exportCSV(filteredRequests, 'requests_export.csv')"
              />
            </div>
          </div>
        </div>
        <br>
        <!-- Main Content Area -->
        <div class="main-content-area">
          <!-- Table Section -->
          <div class="table-section">
            <!-- DataTable -->
            <div class="card">
              <DataTable
                :value="filteredRequests"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                :loading="loading"
                v-model:selection="selectedRequest"
                selectionMode="single"
                dataKey="id"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} requests"
                responsiveLayout="scroll"
                class="p-datatable-sm"
                sortField="id"
                :sortOrder="-1"
              >
                <!-- ID Column -->
                <Column field="id" header="ID" :sortable="true">
                  <template #body="{ data }">
                    <Badge :value="data.id" severity="info" />
                  </template>
                </Column>

                <!-- Model ID Column -->
                <Column field="model_id" header="Model ID" :sortable="true">
                  <template #body="{ data }">
                    <Badge :value="data.model_id" severity="contrast" />
                  </template>
                </Column>

                <!-- Model Name Column -->
                <Column field="model" header="Model Name" :sortable="true">
                  <template #body="{ data }">
                    <span v-if="data.model">
                      {{ data.model }}
                    </span>
                    <span v-else class="text-surface-400">
                      Model ID: {{ data.model_id }}
                    </span>
                  </template>
                </Column>

                <!-- Student Email Column -->
                <Column field="student_email" header="Student Email" :sortable="true" />

                <!-- Class Column -->
                <Column field="class" header="Class" :sortable="true">
                  <template #body="{ data }">
                    <Tag :value="data.class" severity="info" rounded />
                  </template>
                </Column>

                <!-- Quantity Column -->
                <Column field="quantity" header="Quantity" :sortable="true">
                  <template #body="{ data }">
                    <Badge 
                      :value="data.quantity" 
                      :severity="getQuantitySeverity(data.quantity)"
                    />
                  </template>
                </Column>

                <!-- Created At Column -->
                <Column field="timestamp" header="Created At" :sortable="true">
                  <template #body="{ data }">
                    {{ formatDate(data.timestamp) }}
                  </template>
                </Column>
              </DataTable>
            </div>

            <!-- Selection Summary -->
            <div v-if="selectedRequest" class="mt-4 p-4 bg-primary-50 rounded-lg">
              <div class="flex justify-between items-center">
                <div>
                  <span class="font-medium text-primary-900">
                    1 request selected
                  </span>
                  <p class="text-sm text-primary-700 mt-1">
                    Quantity: {{ selectedRequest?.quantity || 0 }}
                  </p>
                  <p class="text-sm text-primary-700 mt-1" v-if="selectedRequest.model">
                    Model: {{ selectedRequest.model }}
                  </p>
                </div>
                <Button 
                  label="Clear Selection" 
                  text 
                  size="small"
                  @click="selectedRequest = null"
                />
              </div>
            </div>

            <!-- Stats Cards -->
            <br>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div class="card text-center p-6">
                <div class="text-3xl font-bold text-primary-600">{{ totalRequests }}</div>
                <div class="text-surface-600 mt-2">Total Requests</div>
              </div>
              <br>
              <div class="card text-center p-6">
                <div class="text-3xl font-bold text-green-600">{{ highQuantityRequests }}</div>
                <div class="text-surface-600 mt-2">High Quantity (10+)</div>
              </div>
              <br>
              <div class="card text-center p-6">
                <div class="text-3xl font-bold text-blue-600">{{ recentRequests }}</div>
                <div class="text-surface-600 mt-2">Last 24 Hours</div>
              </div>
            </div>
          </div>

          <!-- Sidebar Actions -->
          <div class="sidebar-section">
            <div class="card sticky-sidebar">
              <div class="flex flex-col">
                <!-- User Info -->
                <div class="p-4 border-b">
                  <div class="text-lg font-semibold text-surface-900"><strong>Quick Actions</strong></div>
                </div>
                <br/>

                <!-- Admin Actions -->
                <div class="p-4">
                  <div class="space-y-3">
                    <Button 
                      label="Update Selected" 
                      icon="pi pi-pencil" 
                      class="w-full justify-start"
                      @click="editSelectedRequest"
                      :disabled="!selectedRequest"
                      v-tooltip="'Update selected request'"
                    />
                    <Button 
                      label="Approve Selected" 
                      icon="pi pi-check" 
                      class="w-full justify-start"
                      severity="success"
                      @click="approveSelectedRequest"
                      :disabled="!selectedRequest"
                      v-tooltip="'Approve request and add to logs'"
                    />
                    <Button 
                      label="Delete Selected" 
                      icon="pi pi-trash" 
                      class="w-full justify-start"
                      severity="danger"
                      @click="deleteSelectedRequest"
                      :disabled="!selectedRequest"
                      v-tooltip="'Delete selected request'"
                    />
                  </div>
                </div>

                <!-- Selection Info -->
                <div v-if="selectedRequest" class="p-4 border-t">
                  <div class="text-sm font-medium text-surface-700 mb-2">Selected Request:</div>
                  <div class="text-xs text-surface-600 space-y-1">
                    <div>ID: {{ selectedRequest.id }}</div>
                    <div>Model ID: {{ selectedRequest.model_id }}</div>
                    <div v-if="selectedRequest.model">Model: {{ selectedRequest.model }}</div>
                    <div>Student: {{ selectedRequest.student_email }}</div>
                    <div>Class: {{ selectedRequest.class }}</div>
                    <div>Quantity: {{ selectedRequest.quantity }}</div>
                    <div>Requested: {{ formatDate(selectedRequest.timestamp) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit/Update Request Dialog -->
    <Dialog 
      v-model:visible="showEditDialog" 
      :style="{ width: '500px' }" 
      header="Update Request"
      :modal="true"
    >
      <div class="p-fluid">
        <div class="field">
          <label for="editModelId">Model ID </label>
          <InputNumber 
            id="editModelId"
            v-model="editForm.model_id"
            :min="1"
            class="mt-2 w-full"
          />
        </div>
        <br/>
        <div class="field">
          <label for="editStudentEmail">Student Email </label>
          <InputText 
            id="editStudentEmail"
            v-model="editForm.student_email"
            class="mt-2"
          />
        </div>
        <br/>
        <div class="field">
          <label for="editClass">Class </label>
          <InputText 
            id="editClass"
            v-model="editForm.class"
            class="mt-2"
          />
        </div>
        <br/>
        <div class="field">
          <label for="editQuantity">Quantity </label>
          <InputNumber 
            id="editQuantity"
            v-model="editForm.quantity"
            :min="1"
            showButtons
            class="mt-2 w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          @click="showEditDialog = false" 
          class="p-button-text"
          severity="danger"
        />
        <Button 
          label="Update" 
          icon="pi pi-check" 
          @click="updateRequest"
          autofocus
          :loading="updatingRequest"
        />
      </template>
    </Dialog>

    <!-- Confirmation Dialog -->
    <Dialog 
      v-model:visible="showConfirmDialog" 
      :style="{ width: '450px' }" 
      header="Confirmation"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>{{ confirmMessage }}</span>
      </div>
      
      <template #footer>
        <Button 
          label="No" 
          icon="pi pi-times" 
          @click="showConfirmDialog = false" 
          class="p-button-text"
          severity="secondary"
        />
        <Button 
          label="Yes" 
          icon="pi pi-check" 
          @click="confirmAction" 
          autofocus
          :loading="confirmLoading"
          :severity="confirmSeverity"
        />
      </template>
    </Dialog>

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, transformVNodeArgs } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dialog from 'primevue/dialog'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import Tooltip from 'primevue/tooltip'
import { useToast } from 'primevue/usetoast'
import Navbar from '@/components/Navbar.vue'
import { exportCSV } from '@/utils/exportCSV.js'

const vTooltip = Tooltip

const router = useRouter()
const toast = useToast()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// State
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const requests = ref([])
const loading = ref(false)
const selectedRequest = ref(null)
const searchQuery = ref('')

// Dialog states
const showEditDialog = ref(false)
const updatingRequest = ref(false)
const approvingRequest = ref(false)

// Confirmation dialog state
const showConfirmDialog = ref(false)
const confirmLoading = ref(false)
const confirmActionType = ref('')
const confirmMessage = ref('')
const confirmSeverity = ref('danger')
const confirmCallback = ref(null)

// Edit form
const editForm = ref({
  id: null,
  model_id: null,
  student_email: '',
  class: '',
  quantity: 1
})

onMounted(() => {
  checkAdminAccess()
  loadData()
})

// Check if user is admin
const checkAdminAccess = () => {
  const userRole = user.value?.role
  if (userRole !== 'admin') {
    toast.add({
      severity: 'error',
      summary: 'Access Denied',
      detail: 'Only administrators can access this page',
      life: 3000
    })
    router.push('/')
  }
}

// Computed properties
const totalRequests = computed(() => requests.value.length)
const highQuantityRequests = computed(() => requests.value.filter(r => r.quantity >= 10).length)
const recentRequests = computed(() => {
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000))
  return requests.value.filter(r => {
    const requestDate = new Date(r.timestamp)
    return requestDate >= twentyFourHoursAgo
  }).length
})

// Filter requests based on search
const filteredRequests = computed(() => {
  if (!searchQuery.value.trim()) {
    return [...requests.value].sort((a, b) => (b.id || 0) - (a.id || 0)) // Newest first
  }
  
  const searchTerm = searchQuery.value.toLowerCase().trim()
  return requests.value.filter(request => {
    return Object.values(request).some(value => {
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchTerm)
    })
  }).sort((a, b) => (b.id || 0) - (a.id || 0))
})

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const response = await fetch(apiUrl + '/requests/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
        return
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    if (data.success && data.data) {
      // API now returns model name directly via SQL JOIN
      requests.value = data.data.sort((a, b) => (b.id || 0) - (a.id || 0))
      
      toast.add({
        severity: 'success',
        summary: 'Data Loaded',
        detail: `Loaded ${data.data.length} requests`,
        life: 3000
      })
    } else {
      throw new Error(data.message || 'Failed to load data')
    }
  } catch (error) {
    console.error('Error loading requests:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to load requests data',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

// Show confirmation dialog
const showConfirmation = (actionType, message, severity = 'danger', callback) => {
  confirmActionType.value = actionType
  confirmMessage.value = message
  confirmSeverity.value = severity
  confirmCallback.value = callback
  showConfirmDialog.value = true
}

// Handle confirmed action
const confirmAction = async () => {
  confirmLoading.value = true
  
  try {
    if (confirmCallback.value) {
      await confirmCallback.value()
    }
    showConfirmDialog.value = false
  } catch (error) {
    console.error('Error in confirmation action:', error)
  } finally {
    confirmLoading.value = false
  }
}

// Edit request
const editRequest = (request) => {
  selectedRequest.value = request
  openEditDialog()
}

const editSelectedRequest = () => {
  if (!selectedRequest.value) {
    toast.add({
      severity: 'warn',
      summary: 'No Request Selected',
      detail: 'Please select a request first',
      life: 3000
    })
    return
  }
  openEditDialog()
}

const openEditDialog = () => {
  editForm.value = {
    id: selectedRequest.value.id,
    model_id: selectedRequest.value.model_id,
    student_email: selectedRequest.value.student_email,
    class: selectedRequest.value.class,
    quantity: selectedRequest.value.quantity
  }
  showEditDialog.value = true
}

// Update request
const updateRequest = async () => {
  if (!editForm.value.id) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No request ID found',
      life: 3000
    })
    return
  }

  updatingRequest.value = true
  
  try {
    const response = await fetch(`${apiUrl}/requests/${editForm.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        model_id: editForm.value.model_id,
        student_email: editForm.value.student_email,
        class: editForm.value.class,
        quantity: editForm.value.quantity
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      toast.add({
        severity: 'success',
        summary: 'Request Updated',
        detail: 'Request has been updated successfully',
        life: 3000
      })
      
      // Update local data - preserving model name if available
      const index = requests.value.findIndex(r => r.id === editForm.value.id)
      if (index !== -1) {
        requests.value[index] = { 
          ...requests.value[index], 
          ...editForm.value,
          model: data.data?.model || requests.value[index].model // Preserve model name
        }
      }
      
      showEditDialog.value = false
      selectedRequest.value = null
    } else {
      throw new Error(data.message || 'Failed to update request')
    }
  } catch (error) {
    console.error('Error updating request:', error)
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: error.message || 'Failed to update request',
      life: 5000
    })
  } finally {
    updatingRequest.value = false
  }
}

// Approve request (create log and delete request)
const approveRequest = (request) => {
  selectedRequest.value = request
  approveSelectedRequest()
}
const getItem = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))     
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.success && data.data) {
      return data.data
    } else {
      throw new Error(data.message || 'Failed to get quantity')
    }
  } catch (error) {
    console.error('Error getting quantity:', error)
    throw error
  }
    }
const updateItem = async (data) => {
   try {
    const response = await fetch(`${apiUrl}/inventory/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const responseData = await response.json()

    if (responseData.success) {
      toast.add({
        severity: 'success',
        summary: 'Request Approved',
        detail: 'Request has been approved successfully',
        life: 3000
      })
    } else {
      throw new Error(responseData.message || 'Failed to update quantity')
    }
  } catch (error) {
    console.error('Error updating quantity:', error)
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: error.message || 'Failed to update quantity',
      life: 5000
    })
  }
    }
const approveSelectedRequest = () => {
  if (!selectedRequest.value) {
    toast.add({
      severity: 'warn',
      summary: 'No Request Selected',
      detail: 'Please select a request first',
      life: 3000
    })
    return
  }
  
  const request = selectedRequest.value
  showConfirmation(
    'approve',
    `Are you sure you want to approve this request from ${request.student_email}? This will add it to logs and update inventory.`,
    'success',
    async () => {
      approvingRequest.value = true
      
      try {
        // Step 1: Check if item exists and has sufficient quantity
        let inventoryItem
        try {
          inventoryItem = await getItem(request.model_id)
        } catch (error) {
          throw new Error(`Item with Model ID ${request.model_id} not found in inventory`)
        }
        
        // Check if sufficient quantity is available
        const currentQuantity = inventoryItem.quantity || 0
        const requestedQuantity = request.quantity || 0
        
        if (currentQuantity < requestedQuantity) {
          throw new Error(
            `Insufficient inventory! Available: ${currentQuantity}, Requested: ${requestedQuantity}`
          )
        }
        
        // Step 2: Create log entry
        const logData = {
          model_id: request.model_id,
          student_email: request.student_email,
          class_name: request.class,
          quantity: request.quantity
        }
        
        console.log('Creating log entry:', logData)
        
        const logResponse = await fetch(apiUrl + '/logs/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(logData)
        })

        if (!logResponse.ok) {
          const errorData = await logResponse.json().catch(() => ({}))
          throw new Error(errorData.message || `Failed to create log: ${logResponse.status}`)
        }
        
        const logResult = await logResponse.json()
        
        if (!logResult.success) {
          throw new Error(logResult.message || 'Failed to create log entry')
        }
        
        // Step 3: Update inventory quantity (subtract requested quantity)
        const updatedInventoryData = {
          id: inventoryItem.id,
          model: inventoryItem.model,
          description: inventoryItem.description,
          category: inventoryItem.category,
          quantity: currentQuantity - requestedQuantity,
          location: inventoryItem.location,
          last_updated: new Date().toISOString()
        }
        
        await updateItem(updatedInventoryData)
        
        // Step 4: Delete the request
        const deleteResponse = await fetch(`${apiUrl}/requests/${request.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!deleteResponse.ok) {
          // Even if delete fails, log was created and inventory updated
          console.warn('Log created and inventory updated but failed to delete request')
        }
        
        const deleteResult = await deleteResponse.json().catch(() => ({ success: false }))
        
        // Step 5: Update UI
        toast.add({
          severity: 'success',
          summary: 'Request Approved',
          detail: `Request approved. Inventory updated: ${currentQuantity} → ${currentQuantity - requestedQuantity}`,
          life: 4000
        })
        
        // Remove from local data
        requests.value = requests.value.filter(r => r.id !== request.id)
        selectedRequest.value = null
        
      } catch (error) {
        console.error('Error approving request:', error)
        toast.add({
          severity: 'error',
          summary: 'Approval Failed',
          detail: error.message || 'Failed to approve request',
          life: 5000
        })
        throw error
      } finally {
        approvingRequest.value = false
      }
    }
  )
}

// Delete request
const deleteRequest = (request) => {
  selectedRequest.value = request
  deleteSelectedRequest()
}

const deleteSelectedRequest = () => {
  if (!selectedRequest.value) {
    toast.add({
      severity: 'warn',
      summary: 'No Request Selected',
      detail: 'Please select a request to delete',
      life: 3000
    })
    return
  }

  showConfirmation(
    'delete',
    `Are you sure you want to delete this request from ${selectedRequest.value.student_email}?`,
    'danger',
    async () => {
      const requestId = selectedRequest.value.id
      
      try {
        const response = await fetch(`${apiUrl}/requests/${requestId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.success) {
          toast.add({
            severity: 'success',
            summary: 'Request Deleted',
            detail: 'Request has been deleted successfully',
            life: 3000
          })
          
          // Remove from local data
          requests.value = requests.value.filter(r => r.id !== requestId)
          selectedRequest.value = null
        } else {
          throw new Error(data.message || 'Failed to delete request')
        }
      } catch (error) {
        console.error('Error deleting request:', error)
        toast.add({
          severity: 'error',
          summary: 'Delete Failed',
          detail: error.message || 'Failed to delete request',
          life: 5000
        })
        throw error
      }
    }
  )
}

// Handle search
const handleSearch = () => {
  // Optional: Add debounce here if needed
}

// Helper functions
const getQuantitySeverity = (quantity) => {
  if (quantity === 0) return 'danger'
  if (quantity < 5) return 'warning'
  if (quantity < 10) return 'info'
  return 'success'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.requests-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-container {
  padding: 1.5rem;
}

.content-wrapper {
  max-width: 1800px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.main-content-area {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.table-section {
  flex: 1;
  min-width: 0;
}

.sidebar-section {
  width: 280px;
  flex-shrink: 0;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

.sticky-sidebar {
  position: sticky;
  top: 6rem;
  max-height: calc(100vh - 8rem);
  overflow-y: auto;
}

.grid {
  display: grid;
}

.ml-4 {
  margin-left: 1rem;
}

.table-section,
.sidebar-section {
  margin-top: 0;
}

.space-y-3 {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 1rem;
}

.sidebar-section .card {
  margin-top: 1rem;
}

.confirmation-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1200px) {
  .main-content-area {
    flex-direction: column;
  }
  
  .sidebar-section {
    width: 100%;
    margin-top: 1.5rem;
  }
  
  .sticky-sidebar {
    position: static;
    max-height: none;
  }
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .main-container {
    padding: 1rem;
  }
}
</style>