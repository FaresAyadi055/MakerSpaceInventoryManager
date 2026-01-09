<!-- src/views/AdminsView.vue -->
<template>
  <div class="admins-view">
    <Navbar />
    
    <div class="main-container">
      <div class="content-wrapper">
        <!-- Header -->
        <div class="header-section">
          <div>
            <h1 class="text-3xl font-bold text-surface-900">
              Admin Users Management
            </h1>
            <br />
            <p class="text-surface-600 mt-2">
              Manage administrator accounts
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
                  placeholder="Search by email..." 
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
                @click="exportCSV(filteredAdmins, 'admins_export.csv')"
              />
            </div>
          </div>
        </div>
        <br

        <!-- Main Content Area -->
        <div class="main-content-area">
          <!-- Table Section -->
          <div class="table-section">
            <!-- DataTable -->
            <div class="card">
              <DataTable
                :value="filteredAdmins"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                :loading="loading"
                v-model:selection="selectedAdmin"
                selectionMode="single"
                dataKey="id"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} admins"
                responsiveLayout="scroll"
                class="p-datatable-sm"
                sortField="id"
                :sortOrder="1"
              >
                <!-- ID Column -->
                <Column field="id" header="ID" :sortable="true">
                  <template #body="{ data }">
                    <Badge :value="data.id" severity="info" />
                  </template>
                </Column>

                <!-- Email Column -->
                <Column field="email" header="Email" :sortable="true">
                  <template #body="{ data }">
                    <div class="flex items-center gap-2">
                      <i class="pi pi-user text-surface-400" />
                      <span>{{" " + data.email +" " }}</span>
                      <Badge 
                        v-if="data.email === currentUserEmail"
                        value="You" 
                        severity="info"
                        size="small"
                      />
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>

            <!-- Selection Summary -->
            <div v-if="selectedAdmin" class="mt-4 p-4 bg-primary-50 rounded-lg">
              <div class="flex justify-between items-center">
                <div>
                  <span class="font-medium text-primary-900">
                    1 admin selected
                  </span>
                  <p class="text-sm text-primary-700 mt-1">
                    Email: {{ selectedAdmin?.email }}
                  </p>
                  <p v-if="selectedAdmin?.email === currentUserEmail" class="text-sm text-amber-600 mt-1">
                    <i class="pi pi-info-circle mr-1"></i> This is your account
                  </p>
                </div>
                <Button 
                  label="Clear Selection" 
                  text 
                  size="small"
                  @click="selectedAdmin = null"
                />
              </div>
            </div>

            <!-- Stats Cards -->
            <br>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div class="card text-center p-6">
                <div class="text-3xl font-bold text-primary-600">{{ totalAdmins }}</div>
                <div class="text-surface-600 mt-2">Total Admins</div>
              </div>
              <br>
              <div class="card text-center p-6">
                <div class="text-3xl font-bold text-green-600">{{ currentUserIsSelected ? 1 : 0 }}</div>
                <div class="text-surface-600 mt-2">Current User Selected</div>
              </div>
            </div>
          </div>

          <!-- Sidebar Actions -->
          <div class="sidebar-section">
            <div class="card sticky-sidebar">
              <div class="flex flex-col">
                <!-- User Info -->
                <div class="p-4 border-b">
                  <div class="text-lg font-semibold text-surface-900"><strong>Admin Actions</strong></div>
                  <p class="text-sm text-surface-600 mt-1">
                    Manage administrator accounts
                  </p>
                </div>
                <br/>

                <!-- Current User Info -->
                <div class="p-4 bg-surface-50 rounded-lg mx-4">
                  <div class="text-sm font-medium text-surface-700">Current User:</div>
                  <div class="text-xs text-surface-600 mt-1 truncate">
                    {{ currentUserEmail }}
                  </div>
                  <div class="text-xs text-surface-500 mt-1">
                    Role: {{ userRole }}
                  </div>
                </div>
                <br/>

                <!-- Admin Actions -->
                <div class="p-4">
                  <div class="space-y-3">
                    <Button 
                      label="Add New Admin" 
                      icon="pi pi-user-plus" 
                      class="w-full justify-start"
                      @click="showAddDialog = true"
                      v-tooltip="'Add a new administrator'"
                    />
                    <Button 
                      label="Update Selected" 
                      icon="pi pi-pencil" 
                      class="w-full justify-start"
                      @click="editSelectedAdmin"
                      :disabled="!selectedAdmin"
                      v-tooltip="'Update selected admin email'"
                    />
                    <Button 
                      label="Delete Selected" 
                      icon="pi pi-trash" 
                      class="w-full justify-start"
                      severity="danger"
                      @click="deleteSelectedAdmin"
                      :disabled="!selectedAdmin || selectedAdmin.email === currentUserEmail"
                      v-tooltip="selectedAdmin?.email === currentUserEmail ? 'Cannot delete your own account' : 'Delete selected admin'"
                    />
                  </div>
                </div>

                <!-- Selection Info -->
                <div v-if="selectedAdmin" class="p-4 border-t">
                  <div class="text-sm font-medium text-surface-700 mb-2">Selected Admin:</div>
                  <div class="text-xs text-surface-600 space-y-1">
                    <div>ID: {{ selectedAdmin.id }}</div>
                    <div>Email: {{ selectedAdmin.email }}</div>
                    <div v-if="selectedAdmin.email === currentUserEmail" class="text-amber-600 font-medium">
                      <i class="pi pi-info-circle mr-1"></i> This is your account
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Admin Dialog -->
    <Dialog 
      v-model:visible="showAddDialog" 
      :style="{ width: '400px' }" 
      header="Add New Admin"
      :modal="true"
    >
      <div class="p-fluid">
        <div class="field">
          <label for="newAdminEmail">Email Address </label>
          <InputText 
            id="newAdminEmail"
            v-model="newAdmin.email"
            placeholder="firstname.lastname@medtech.tn"
            class="mt-2"
          />
          <small class="text-surface-500">Enter the email address for the new administrator</small>
        </div>
      </div>

      <template #footer>
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          @click="showAddDialog = false" 
          class="p-button-text"
          severity="danger"
        />
        <Button 
          label="Add Admin" 
          icon="pi pi-check" 
          @click="addNewAdmin"
          autofocus
          :loading="addingAdmin"
        />
      </template>
    </Dialog>

    <!-- Edit Admin Dialog -->
    <Dialog 
      v-model:visible="showEditDialog" 
      :style="{ width: '400px' }" 
      header="Update Admin Email"
      :modal="true"
    >
      <div class="p-fluid">
        <div class="field">
          <label for="editAdminEmail">Email Address </label>
          <InputText 
            id="editAdminEmail"
            v-model="editForm.email"
            class="mt-2"
          />
          <small class="text-surface-500">Update the email address</small>
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
          @click="updateAdmin"
          autofocus
          :loading="updatingAdmin"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Badge from 'primevue/badge'
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
const admins = ref([])
const loading = ref(false)
const selectedAdmin = ref(null)
const searchQuery = ref('')

// Dialog states
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const addingAdmin = ref(false)
const updatingAdmin = ref(false)

// Confirmation dialog state
const showConfirmDialog = ref(false)
const confirmLoading = ref(false)
const confirmActionType = ref('')
const confirmMessage = ref('')
const confirmSeverity = ref('danger')
const confirmCallback = ref(null)

// Forms
const newAdmin = ref({
  email: ''
})

const editForm = ref({
  id: null,
  email: ''
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
const currentUserEmail = computed(() => user.value?.email || '')
const userRole = computed(() => user.value?.role || '')
const currentUserIsSelected = computed(() => {
  return selectedAdmin.value?.email === currentUserEmail.value
})

const totalAdmins = computed(() => admins.value.length)

// Filter admins based on search
const filteredAdmins = computed(() => {
  if (!searchQuery.value.trim()) {
    return [...admins.value].sort((a, b) => (a.id || 0) - (b.id || 0))
  }
  
  const searchTerm = searchQuery.value.toLowerCase().trim()
  return admins.value.filter(admin => {
    return admin.email.toLowerCase().includes(searchTerm)
  }).sort((a, b) => (a.id || 0) - (b.id || 0))
})

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const response = await fetch(apiUrl + '/admins/', {
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
      admins.value = data.data.sort((a, b) => (a.id || 0) - (b.id || 0))
      
      toast.add({
        severity: 'success',
        summary: 'Data Loaded',
        detail: `Loaded ${data.data.length} administrators`,
        life: 3000
      })
    } else {
      throw new Error(data.message || 'Failed to load data')
    }
  } catch (error) {
    console.error('Error loading admins:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to load administrators data',
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

// Add new admin
const addNewAdmin = async () => {
  if (!newAdmin.value.email?.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Email Required',
      detail: 'Please enter an email address',
      life: 3000
    })
    return
  }

  // Updated email validation for medtech.tn pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(medtech|smu)\.tn$/i
  const email = newAdmin.value.email.trim()
  
  if (!emailRegex.test(email)) {
    toast.add({
      severity: 'warn',
      summary: 'Invalid Email Format',
      detail: 'Email must be in the format: firstname.lastname@medtech.tn',
      life: 4000
    })
    return
  }

  addingAdmin.value = true
  
  try {
    const response = await fetch(apiUrl + '/admins/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        email: email
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      toast.add({
        severity: 'success',
        summary: 'Admin Added',
        detail: `Administrator ${email} has been added successfully`,
        life: 3000
      })
      
      // Reset form and reload data
      newAdmin.value = { email: '' }
      showAddDialog.value = false
      loadData()
    } else {
      throw new Error(data.message || 'Failed to add admin')
    }
  } catch (error) {
    console.error('Error adding admin:', error)
    toast.add({
      severity: 'error',
      summary: 'Add Failed',
      detail: error.message || 'Failed to add administrator',
      life: 5000
    })
  } finally {
    addingAdmin.value = false
  }
}

// Edit admin
const editSelectedAdmin = () => {
  if (!selectedAdmin.value) {
    toast.add({
      severity: 'warn',
      summary: 'No Admin Selected',
      detail: 'Please select an admin first',
      life: 3000
    })
    return
  }

  if (selectedAdmin.value.email === currentUserEmail.value) {
    toast.add({
      severity: 'info',
      summary: 'Editing Your Account',
      detail: 'You are updating your own account',
      life: 3000
    })
  }

  openEditDialog()
}

const openEditDialog = () => {
  editForm.value = {
    id: selectedAdmin.value.id,
    email: selectedAdmin.value.email
  }
  showEditDialog.value = true
}

// Update admin
const updateAdmin = async () => {
  if (!editForm.value.id) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No admin ID found',
      life: 3000
    })
    return
  }

  if (!editForm.value.email?.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Email Required',
      detail: 'Please enter an email address',
      life: 3000
    })
    return
  }

  // Updated email validation for medtech.tn pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(medtech|smu)\.tn$/i
  const email = editForm.value.email.trim()
  
  if (!emailRegex.test(email)) {
    toast.add({
      severity: 'warn',
      summary: 'Invalid Email Format',
      detail: 'Email must be in the format: firstname.lastname@medtech.tn',
      life: 4000
    })
    return
  }

  updatingAdmin.value = true
  
  try {
    const response = await fetch(`${apiUrl}/admins/${editForm.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        email: email
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      toast.add({
        severity: 'success',
        summary: 'Admin Updated',
        detail: 'Administrator has been updated successfully',
        life: 3000
      })
      
      // Update local data
      const index = admins.value.findIndex(admin => admin.id === editForm.value.id)
      if (index !== -1) {
        admins.value[index].email = email
      }
      
      // If current user updated their own email, update localStorage
      if (selectedAdmin.value.email === currentUserEmail.value) {
        const updatedUser = { ...user.value, email: email }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        user.value = updatedUser
      }
      
      showEditDialog.value = false
      selectedAdmin.value = null
    } else {
      throw new Error(data.message || 'Failed to update admin')
    }
  } catch (error) {
    console.error('Error updating admin:', error)
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: error.message || 'Failed to update administrator',
      life: 5000
    })
  } finally {
    updatingAdmin.value = false
  }
}

// Delete admin
const deleteSelectedAdmin = () => {
  if (!selectedAdmin.value) {
    toast.add({
      severity: 'warn',
      summary: 'No Admin Selected',
      detail: 'Please select an admin to delete',
      life: 3000
    })
    return
  }

  // Prevent deleting own account
  if (selectedAdmin.value.email === currentUserEmail.value) {
    toast.add({
      severity: 'error',
      summary: 'Cannot Delete',
      detail: 'You cannot delete your own account',
      life: 3000
    })
    return
  }

  showConfirmation(
    'delete',
    `Are you sure you want to delete administrator "${selectedAdmin.value.email}"?`,
    'danger',
    async () => {
      const adminId = selectedAdmin.value.id
      
      try {
        const response = await fetch(`${apiUrl}/admins/${adminId}`, {
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
            summary: 'Admin Deleted',
            detail: 'Administrator has been deleted successfully',
            life: 3000
          })
          loadData()
          selectedAdmin.value = null
        } else {
          throw new Error(data.message || 'Failed to delete admin')
        }
      } catch (error) {
        console.error('Error deleting admin:', error)
        toast.add({
          severity: 'error',
          summary: 'Delete Failed',
          detail: error.message || 'Failed to delete administrator',
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
</script>

<style scoped>
.admins-view {
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