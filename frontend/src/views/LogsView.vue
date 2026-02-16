<!-- src/views/LogsView.vue -->
<template>
  <div class="logs-view">
    <Navbar />
    
    <div class="main-container">
      <div class="content-wrapper">
        <!-- Header -->
        <div class="header-section">
          <div>
            <h1 class="text-3xl font-bold text-surface-900">
              Logs Management
            </h1>
            <br />
            <p class="text-surface-600 mt-2">
              Manage all approved requests
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
                @click="exportCSV(filteredLogs, 'logs_export.csv')"
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
                :value="filteredLogs"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                :loading="loading"
                v-model:selection="selectedLog"
                selectionMode="single"
                dataKey="id"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} logs"
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

                <!-- Student Email Column -->
                <Column field="student_email" header="Student Email" :sortable="true" />

                <!-- Class Name Column -->
                <Column field="class_name" header="Class" :sortable="true">
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
                <Column field="timestamp" header="Logged At" :sortable="true">
                  <template #body="{ data }">
                    {{ formatDate(data.timestamp) }}
                  </template>
                </Column>
                                <!-- ID Column -->
                <Column field="status" header="status" :sortable="true">
                  <template #body="{ data }">  
                    <Badge :value="data.status" :severity="data.status === 'returned' ? 'success' : 'danger'" />
                  </template>
                </Column>
              </DataTable>
            </div>

            <!-- Selection Summary -->
            <div v-if="selectedLog" class="mt-4 p-4 bg-primary-50 rounded-lg">
              <div class="flex justify-between items-center">
                <div>
                  <span class="font-medium text-primary-900">
                    1 log selected
                  </span>
                  <p class="text-sm text-primary-700 mt-1">
                    Model ID: {{ selectedLog?.model_id }}
                  </p>
                  <p class="text-sm text-primary-700 mt-1">
                    Quantity: {{ selectedLog?.quantity || 0 }}
                  </p>
                </div>
                <Button 
                  label="Clear Selection" 
                  text 
                  size="small"
                  @click="selectedLog = null"
                />
              </div>
            </div>

            <!-- Stats Cards -->
            <br>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div class="card text-center p-6">
                <div class="text-3xl font-bold text-primary-600">{{ totalLogs }}</div>
                <div class="text-surface-600 mt-2">Total Logs</div>
              </div>
              <br>
              <div class="card text-center p-6">
                <div class="text-3xl font-bold text-green-600">{{ highQuantityLogs }}</div>
                <div class="text-surface-600 mt-2">High Quantity (10+)</div>
              </div>
              <br>
              <div class="card text-center p-6">
                <div class="text-3xl font-bold text-blue-600">{{ recentLogs }}</div>
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
                  <div class="text-lg font-semibold text-surface-900"><strong>Log Actions</strong></div>
                  <p class="text-sm text-surface-600 mt-1">
                    Manage request logs
                  </p>
                </div>
                <br/>

                <!-- Current User Info -->
                <div class="p-4 bg-surface-50 rounded-lg mx-4">
                  <div class="text-sm font-medium text-surface-700">Current User:</div>
                  <div class="text-xs text-surface-600 mt-1 truncate">
                    {{ currentUserEmail }}
                  </div>
                </div>
                <br/>

                <!-- Admin Actions -->
                <div class="p-4">
                  <div class="space-y-3">
                <Button 
                    label="Return Item" 
                    icon="pi pi-undo" 
                    class="w-full justify-start"
                    severity="success"
                    @click="returnSelectedItem"
                    :disabled="!selectedLog || selectedLog?.status === 'returned'"
                    v-tooltip="selectedLog?.status === 'returned' ? 'Item already returned' : 'Mark item as returned and add to inventory'"
                  />
                    <Button 
                      label="Add New Log" 
                      icon="pi pi-plus" 
                      class="w-full justify-start"
                      @click="showAddDialog = true"
                      v-tooltip="'Add a new log entry'"
                    />
                    <Button 
                      label="Update Selected" 
                      icon="pi pi-pencil" 
                      class="w-full justify-start"
                      @click="editSelectedLog"
                      :disabled="!selectedLog"
                      v-tooltip="'Update selected log entry'"
                    />
                    <Button 
                      label="Delete Selected" 
                      icon="pi pi-trash" 
                      class="w-full justify-start"
                      severity="danger"
                      @click="deleteSelectedLog"
                      :disabled="!selectedLog"
                      v-tooltip="'Delete selected log entry'"
                    />
                  </div>
                </div>

                <!-- Selection Info -->
            <div v-if="selectedLog" class="p-4 border-t">
              <div class="text-sm font-medium text-surface-700 mb-2">Selected Log:</div>
              <div class="text-xs text-surface-600 space-y-1">
                <div>ID: {{ selectedLog.id }}</div>
                <div>Model ID: {{ selectedLog.model_id }}</div>
                <div>Student: {{ selectedLog.student_email }}</div>
                <div>Class: {{ selectedLog.class_name }}</div>
                <div>Quantity: {{ selectedLog.quantity }}</div>
                <div>Status: 
                  <Badge 
                    :value="selectedLog.status" 
                    :severity="selectedLog.status === 'returned' ? 'success' : 'danger'" 
                    size="small"
                  />
                </div>
                <div>Logged: {{ formatDate(selectedLog.timestamp) }}</div>
              </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Log Dialog -->
    <Dialog 
      v-model:visible="showAddDialog" 
      :style="{ width: '500px' }" 
      header="Add New Log"
      :modal="true"
    >
      <div class="p-fluid">
        <div class="field">
          <label for="addModelId">Model ID</label>
          <InputNumber 
            id="addModelId"
            v-model="newLog.model_id"
            :min="1"
            class="mt-2 w-full"
          />
        </div>
        <br/>
        <div class="field">
          <label for="addStudentEmail">Student Email</label>
          <InputText 
            id="addStudentEmail"
            v-model="newLog.student_email"
            class="mt-2"
          />
        </div>
        <br/>
        <div class="field">
          <label for="addQuantity">Quantity</label>
          <InputNumber 
            id="addQuantity"
            v-model="newLog.quantity"
            :min="1"
            showButtons
            class="mt-2 w-full"
          />
        </div>
        <br/>
        <div class="field">
          <label for="class">Class</label>
          <div class="flex gap-2 mt-2">
            <Select 
              v-model="newLog.class_prefix"
              :options="classPrefixes"
              placeholder="Cohort"
              class="flex-1"
            />
            <Select 
              v-model="newLog.class_number"
              :options="classNumbers"
              placeholder="Group"
              class="flex-1"
            />
          </div>
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
          label="Add Log" 
          icon="pi pi-check" 
          @click="addNewLog"
          autofocus
          :loading="addingLog"
        />
      </template>
    </Dialog>

    <!-- Edit Log Dialog -->
    <Dialog 
      v-model:visible="showEditDialog" 
      :style="{ width: '500px' }" 
      header="Update Log"
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
          <label for="editQuantity">Quantity </label>
          <InputNumber 
            id="editQuantity"
            v-model="editForm.quantity"
            :min="1"
            showButtons
            class="mt-2 w-full"
          />
        </div>
        <br/>
        <div class="field">
          <label for="class">Class </label>
          <div class="flex gap-2 mt-2">
            <br>
            <Select 
              v-model="editForm.class_prefix"
              :options="classPrefixes"
              placeholder="Cohort"
              class="flex-1"
            />
            <Select 
              v-model="editForm.class_number"
              :options="classNumbers"
              placeholder="Group"
              class="flex-1"
            />
          </div>
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
          @click="updateLog"
          autofocus
          :loading="updatingLog"
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
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
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
const logs = ref([])
const loading = ref(false)
const selectedLog = ref(null)
const searchQuery = ref('')

// Dialog states
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const addingLog = ref(false)
const updatingLog = ref(false)

// Confirmation dialog state
const showConfirmDialog = ref(false)
const confirmLoading = ref(false)
const confirmActionType = ref('')
const confirmMessage = ref('')
const confirmSeverity = ref('danger')
const confirmCallback = ref(null)

// Options
const classPrefixes = ref(['Freshman', 'Sophomore RE','Sophomore CSE','Junior RE', 'Junior CSE','Senior RE', 'Senior CSE', 'Final Year RE', 'Final Year CSE',"Licence"])
const classNumbers = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

// Forms
const newLog = ref({
  model_id: null,
  student_email: '',
  class_prefix: '',
  class_number: null,
  quantity: 1
})

const editForm = ref({
  id: null,
  model_id: null,
  student_email: '',
  class_prefix: '',
  class_number: null,
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
const currentUserEmail = computed(() => user.value?.email || '')

const totalLogs = computed(() => logs.value.length)
const highQuantityLogs = computed(() => logs.value.filter(log => log.quantity >= 10).length)
const recentLogs = computed(() => {
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000))
  return logs.value.filter(log => {
    const logDate = new Date(log.timestamp)
    return logDate >= twentyFourHoursAgo
  }).length
})

// Filter logs based on search
const filteredLogs = computed(() => {
  if (!searchQuery.value.trim()) {
    return [...logs.value].sort((a, b) => (b.id || 0) - (a.id || 0)) // Newest first
  }
  
  const searchTerm = searchQuery.value.toLowerCase().trim()
  return logs.value.filter(log => {
    return Object.values(log).some(value => {
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchTerm)
    })
  }).sort((a, b) => (b.id || 0) - (a.id || 0))
})

// Parse class name into prefix and number
const parseClassName = (className) => {
  if (!className) return { prefix: '', number: null }
  
  // Try to match patterns like "Junior RE G2" or "Freshman G5"
  const match = className.match(/^(.+?)\s+G(\d+)$/)
  if (match) {
    return { prefix: match[1].trim(), number: parseInt(match[2]) }
  }
  
  // If pattern doesn't match, return the whole thing as prefix
  return { prefix: className, number: null }
}

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const response = await fetch(apiUrl + '/logs/', {
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
    console.log(data)
    if (data.success && data.data) {
      logs.value = data.data.sort((a, b) => (b.id || 0) - (a.id || 0))
      
      toast.add({
        severity: 'success',
        summary: 'Data Loaded',
        detail: `Loaded ${data.data.length} log entries`,
        life: 3000
      })
    } else {
      throw new Error(data.message || 'Failed to load data')
    }
  } catch (error) {
    console.error('Error loading logs:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to load logs data',
      life: 5000
    })
  } finally {
    loading.value = false
    console.log('Logs loaded:', data.data)
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

// Add new log
const addNewLog = async () => {
  // Validation
  if (!newLog.value.model_id || newLog.value.model_id < 1) {
    toast.add({
      severity: 'warn',
      summary: 'Model ID Required',
      detail: 'Please enter a valid Model ID',
      life: 3000
    })
    return
  }

  if (!newLog.value.student_email?.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Student Email Required',
      detail: 'Please enter a student email',
      life: 3000
    })
    return
  }

  if (!newLog.value.class_prefix || !newLog.value.class_number) {
    toast.add({
      severity: 'warn',
      summary: 'Class Required',
      detail: 'Please select both cohort and group',
      life: 3000
    })
    return
  }

  if (!newLog.value.quantity || newLog.value.quantity < 1) {
    toast.add({
      severity: 'warn',
      summary: 'Quantity Required',
      detail: 'Please enter a valid quantity',
      life: 3000
    })
    return
  }

  addingLog.value = true
  
  try {
    const class_name = `${newLog.value.class_prefix} G${newLog.value.class_number}`
    
    const response = await fetch(apiUrl + '/logs/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        model_id: newLog.value.model_id,
        student_email: newLog.value.student_email.trim(),
        class_name: class_name,
        quantity: newLog.value.quantity
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
        summary: 'Log Added',
        detail: 'Log entry has been added successfully',
        life: 3000
      })
      
      // Reset form and reload data
      newLog.value = {
        model_id: null,
        student_email: '',
        class_prefix: '',
        class_number: null,
        quantity: 1
      }
      showAddDialog.value = false
      loadData()
    } else {
      throw new Error(data.message || 'Failed to add log')
    }
  } catch (error) {
    console.error('Error adding log:', error)
    toast.add({
      severity: 'error',
      summary: 'Add Failed',
      detail: error.message || 'Failed to add log entry',
      life: 5000
    })
  } finally {
    addingLog.value = false
  }
}

// Edit log
const editSelectedLog = () => {
  if (!selectedLog.value) {
    toast.add({
      severity: 'warn',
      summary: 'No Log Selected',
      detail: 'Please select a log entry first',
      life: 3000
    })
    return
  }

  // Don't allow editing if status is 'returned'
  if (selectedLog.value.status === 'returned') {
    toast.add({
      severity: 'warn',
      summary: 'Cannot Edit',
      detail: 'Returned items cannot be edited',
      life: 3000
    })
    return
  }

  openEditDialog()
}

const openEditDialog = () => {
  if (!selectedLog.value) return
  
  // Parse the class_name from selected log
  // The class_name format from backend is like "Junior RE G2" or "Freshman G5"
  const className = selectedLog.value.class_name || ''
  let prefix = ''
  let number = null
  
  // Split by " G" to separate prefix and number
  const parts = className.split(' G')
  if (parts.length === 2) {
    prefix = parts[0].trim()
    number = parseInt(parts[1])
  } else {
    // Fallback if format doesn't match
    prefix = className
    number = null
  }
  
  editForm.value = {
    id: selectedLog.value.id,
    model_id: selectedLog.value.model_id,
    student_email: selectedLog.value.student_email,
    class_prefix: prefix,
    class_number: number,
    class: selectedLog.value.class,
    quantity: selectedLog.value.quantity
  }
  showEditDialog.value = true
}

// Update log
const updateLog = async () => {
  if (!editForm.value.id) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No log ID found',
      life: 3000
    })
    return
  }

  // Validation
  if (!editForm.value.model_id || editForm.value.model_id < 1) {
    toast.add({
      severity: 'warn',
      summary: 'Model ID Required',
      detail: 'Please enter a valid Model ID',
      life: 3000
    })
    return
  }

  if (!editForm.value.student_email?.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Student Email Required',
      detail: 'Please enter a student email',
      life: 3000
    })
    return
  }

  if (!editForm.value.class_prefix || !editForm.value.class_number) {
    toast.add({
      severity: 'warn',
      summary: 'Class Required',
      detail: 'Please select both cohort and group',
      life: 3000
    })
    return
  }

  if (!editForm.value.quantity || editForm.value.quantity < 1) {
    toast.add({
      severity: 'warn',
      summary: 'Quantity Required',
      detail: 'Please enter a valid quantity',
      life: 3000
    })
    return
  }

  updatingLog.value = true
  
  try {
    const class_name = `${editForm.value.class_prefix} G${editForm.value.class_number}`

    const response = await fetch(`${apiUrl}/logs/${editForm.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        model_id: editForm.value.model_id,
        student_email: editForm.value.student_email.trim(),
        class_name: class_name || editForm.value.class,
        quantity: editForm.value.quantity,
        status: selectedLog.value.status 
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
        summary: 'Log Updated',
        detail: 'Log entry has been updated successfully',
        life: 3000
      })
      
      // Update local data
      const index = logs.value.findIndex(log => log.id === editForm.value.id)
      if (index !== -1) {
        logs.value[index] = { 
          ...logs.value[index], 
          model_id: editForm.value.model_id,
          student_email: editForm.value.student_email,
          class_name: class_name || editForm.value.class,
          quantity: editForm.value.quantity
        }
      }
      
      showEditDialog.value = false
      selectedLog.value = null
    } else {
      throw new Error(data.message || 'Failed to update log')
    }
  } catch (error) {
    console.error('Error updating log:', error)
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: error.message || 'Failed to update log entry',
      life: 5000
    })
  } finally {
    updatingLog.value = false
  }
}

// Delete log
const deleteSelectedLog = () => {
  if (!selectedLog.value) {
    toast.add({
      severity: 'warn',
      summary: 'No Log Selected',
      detail: 'Please select a log entry to delete',
      life: 3000
    })
    return
  }

  showConfirmation(
    'delete',
    `Are you sure you want to delete this log entry?`,
    'danger',
    async () => {
      const logId = selectedLog.value.id
      
      try {
        const response = await fetch(`${apiUrl}/logs/${logId}`, {
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
            summary: 'Log Deleted',
            detail: 'Log entry has been deleted successfully',
            life: 3000
          })
          loadData()
          selectedLog.value = null
        } else {
          throw new Error(data.message || 'Failed to delete log')
        }
      } catch (error) {
        console.error('Error deleting log:', error)
        toast.add({
          severity: 'error',
          summary: 'Delete Failed',
          detail: error.message || 'Failed to delete log entry',
          life: 5000
        })
        throw error
      }
    }
  )
}
// Add this function in the script section (after deleteSelectedLog function):

// Return item function
const returnSelectedItem = () => {
  if (!selectedLog.value) {
    toast.add({
      severity: 'warn',
      summary: 'No Log Selected',
      detail: 'Please select a log entry to return',
      life: 3000
    })
    return
  }

  // Check if item is already returned
  if (selectedLog.value.status === 'returned') {
    toast.add({
      severity: 'warn',
      summary: 'Already Returned',
      detail: 'This item has already been returned',
      life: 3000
    })
    return
  }

  showConfirmation(
    'return',
    `Are you sure you want to mark this item as returned? This will add ${selectedLog.value.quantity} items back to inventory.`,
    'success',
    async () => {
      try {
        // First, update the log status to 'returned'
        console.log(`${apiUrl}/inventory/add/${selectedLog.value.model_id}`)
        selectedLog.value.class_name = selectedLog.value.class
        const updateLogResponse = await fetch(`${apiUrl}/logs/${selectedLog.value.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...selectedLog.value, // Keep all existing data
            status: 'returned' // Only update status
          })
        })

        if (!updateLogResponse.ok) {
          const errorData = await updateLogResponse.json().catch(() => ({}))
          throw new Error(errorData.message || errorData.error || `HTTP error! status: ${updateLogResponse.status}`)
        }

        const updateLogData = await updateLogResponse.json()
        
        if (updateLogData.success) {
          // Now, add the quantity back to inventory
          const addToInventoryResponse = await fetch(`${apiUrl}/inventory/add/${selectedLog.value.model_id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              quantity: selectedLog.value.quantity
            })
          })

          if (!addToInventoryResponse.ok) {
            const errorData = await addToInventoryResponse.json().catch(() => ({}))
            throw new Error(errorData.message || errorData.error || `HTTP error! status: ${addToInventoryResponse.status}`)
          }

          const inventoryData = await addToInventoryResponse.json()
          
          if (inventoryData.success) {
            toast.add({
              severity: 'success',
              summary: 'Item Returned',
              detail: `Item marked as returned and ${selectedLog.value.quantity} items added back to inventory`,
              life: 4000
            })
            
            // Update local data
            const index = logs.value.findIndex(log => log.id === selectedLog.value.id)
            if (index !== -1) {
              logs.value[index] = { 
                ...logs.value[index], 
                status: 'returned'
              }
            }
            
            // Refresh the selected log to show updated status
            selectedLog.value = { ...selectedLog.value, status: 'returned' }
            
            // Reload data to ensure sync
            loadData()
          } else {
            throw new Error(inventoryData.message || 'Failed to update inventory')
          }
        } else {
          throw new Error(updateLogData.message || 'Failed to update log status')
        }
      } catch (error) {
        console.error('Error returning item:', error)
        toast.add({
          severity: 'error',
          summary: 'Return Failed',
          detail: error.message || 'Failed to return item',
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
.logs-view {
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