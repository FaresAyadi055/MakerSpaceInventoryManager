<!-- src/views/HomeView.vue -->
<template>
  <div class="home">
    <Navbar />
    
    <div class="main-container">
      <div class="content-wrapper">
        <!-- Header -->
        <div class="header-section">
          <div>
            <h1 class="text-3xl font-bold text-surface-900">
              {{ userRole === 'admin' ? 'Inventory Management' : 'Inventory Catalog' }}
            </h1>
            <br />
            <p class="text-surface-600 mt-2">
              {{ userRole === 'admin' ? 'Manage all inventory items' : 'Browse and request for components' }}
            </p>
          </div>
          <br />
          <div class="flex items-center gap-4">
          </div>
        </div>

        <!-- Search -->
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
              <!-- Export CSV Button only for admin -->
              <Button 
                v-if="userRole === 'admin'"   
                label="Export CSV"
                icon="pi pi-file-export" 
                class="ml-4"
                @click="exportCSV(filteredItems, 'inventory_export.csv')"
              />
            </div>
          </div>
        </div>

        <!-- Main Content Area with Sidebar -->
        <div class="main-content-area">
          <!-- Table Section -->
          <div class="table-section">
            <!-- DataTable -->
            <div class="card">
              <DataTable
                :value="filteredItems"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                :loading="loading"
                v-model:selection="selectedItems"
                selectionMode="single"
                dataKey="id"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
                responsiveLayout="scroll"
                class="p-datatable-sm"
                sortField="id"
                :sortOrder="1"
              >
                <!-- Dynamic Columns -->
                <Column 
                  v-for="col in columns" 
                  :key="col.field"
                  :field="col.field" 
                  :header="col.header"
                  :sortable="true"
                >
                  <template #body="{ data }">
                    <span v-if="col.field === 'quantity'">
                      <Badge 
                        :value="data[col.field]" 
                        :severity="getQuantitySeverity(data[col.field])"
                      />
                    </span>
                    <span v-else-if="col.field === 'status'">
                      <Tag 
                        :value="data[col.field]" 
                        :severity="getStatusSeverity(data[col.field])"
                        rounded
                      />
                    </span>
                    <span v-else-if="col.field === 'created_at' || col.field === 'updated_at'">
                      {{ formatDate(data[col.field]) }}
                    </span>
                    <span v-else-if="col.field === 'id'">
                      <Badge :value="data[col.field]" severity="info" />
                    </span>
                    <span v-else>
                      {{ data[col.field] }}
                    </span>
                  </template>
                </Column>
              </DataTable>
            </div>

            <!-- Selection Summary -->
            <div v-if="selectedItems" class="mt-4 p-4 bg-primary-50 rounded-lg">
              <div class="flex justify-between items-center">
                <div>
                  <span class="font-medium text-primary-900">
                    1 item selected
                  </span>
                  <p class="text-sm text-primary-700 mt-1">
                    Quantity: {{ selectedItems?.quantity || 0 }}
                  </p>
                </div>
                <span v-if="userRole === 'admin'">
                  <Button 
                    label="Clear Selection" 
                    text 
                    size="small"
                    @click="selectedItems = null"
                  />
                </span>
              </div>
            </div>

            <!-- Stats Cards only for admin-->
            <br>
            <div v-if="userRole === 'admin'"
            class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <div class="card text-center p-6">
                <div class="text-3xl font-bold text-primary-600">{{ totalItems }}</div>
                <div class="text-surface-600 mt-2">Total Items</div>
              </div>
              <br>
              <div class="card text-center p-6">
                <div class="text-3xl font-bold text-yellow-600">{{ lowStockItems }}</div>
                <div class="text-surface-600 mt-2">Low Stock</div>
              </div>
              <br>
              <div class="card text-center p-6">
                <div class="text-3xl font-bold text-red-600">{{ outOfStockItems }}</div>
                <div class="text-surface-600 mt-2">Out of Stock</div>
              </div>
            </div>
          </div>

          <!-- Sidebar Actions -->
        
          <div class="sidebar-section">
            <div class="card sticky-sidebar">
              <div class="flex flex-col">
                <!-- User Info -->
                <div class="p-4 border-b">
                  <div class="text-lg font-semibold text-surface-900"><strong>Actions</strong></div>
                </div>
                <br/>

                <!-- Student Actions -->
                <div v-if="userRole === 'student'" class="p-4">
                  <div class="space-y-3">
                    <Button 
                      label="Request Item" 
                      icon="pi pi-shopping-cart" 
                      class="w-full justify-start"
                      @click="showRequestDialog = true"
                      :disabled="!selectedItems"
                      v-tooltip="'Request selected item'"
                    />
                  </div>
                </div>
                <br/>
                  <div v-if="userRole === 'student' || userRole === 'admin'" class="p-4">
                  <div class="space-y-3">
                    <Button 
                      label="Request Unavailable Item" 
                      icon="pi pi-shopping-cart" 
                      class="w-full justify-start"
                      @click="showMissingDialog = true" 
                      v-tooltip="'Request unavailable item'"
                    />
                  </div>
                </div>
                <br/>
                <!-- Admin Actions -->
                <div v-if="userRole === 'admin'" class="p-4">
                  <div class="space-y-3">
                    <Button 
                      label="Add New Item" 
                      icon="pi pi-plus" 
                      class="w-full justify-start"
                      @click="showAddDialog = true"
                    />
                    <Button 
                      label="Update Selected" 
                      icon="pi pi-pencil" 
                      class="w-full justify-start"
                      @click="openUpdateDialog"
                      :disabled="!selectedItems"
                      v-tooltip="'Update selected item'"
                    />
                    <Button 
                      label="Delete Selected" 
                      icon="pi pi-trash" 
                      class="w-full justify-start"
                      severity="danger"
                      @click="deleteSelectedItem"
                      :disabled="!selectedItems"
                      v-tooltip="'Delete selected item'"
                    />
                    <Button 
                      label="Request Item" 
                      icon="pi pi-shopping-cart" 
                      class="w-full justify-start"
                      @click="showRequestDialog = true"
                      :disabled="!selectedItems"
                      v-tooltip="'Request selected item'"
                    />
                  </div>
                </div>

                <!-- Selection Info -->
                <div v-if="selectedItems" class="p-4 border-t">
                  <div class="text-sm font-medium text-surface-700 mb-2">Selected Item:</div>
                  <div class="text-xs text-surface-600 space-y-1">
                    <div>ID: {{ selectedItems.id }}</div>
                    <div>Name: {{ selectedItems.model || selectedItems.name }}</div>
                    <div>Quantity: {{ selectedItems.quantity }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
<!--Update Item Dialog -->
<Dialog 
  v-if="userRole === 'admin'"
  v-model:visible="showUpdateDialog" 
  :style="{ width: '500px' }" 
  header="Update Item"
  :modal="true"
>
  <div class="p-fluid">
    <div class="field">
      <label for="updateModel">Model</label>
      <InputText 
        id="updateModel"
        v-model="selectedItems.model"
        class="mt-2"
      />
    </div>
    <br/>
    <div class="field">
      <label for="updateDescription">Description</label>
      <InputText 
        id="updateDescription"
        v-model="selectedItems.description"
        class="mt-2"
      />
    </div>
    <br/>
    <div class="field">
      <label for="updateQuantity">Quantity</label>
      <InputNumber 
        id="updateQuantity"
        v-model="selectedItems.quantity"
        :min="0"
        showButtons
        class="mt-2 w-full"
      />
    </div>
    <br/>
    <div class="field">
      <label for="updateLocation">Location</label>
      <InputText 
        id="updateLocation"
        v-model="selectedItems.location"
        class="mt-2"
      />
    </div>
    <br/>
    <div class="field" v-if="selectedItems.status">
      <label for="updateStatus">Status</label>
      <Select 
        id="updateStatus"
        v-model="selectedItems.status"
        :options="statusOptions"
        placeholder="Select Status"
        class="mt-2"
      />
    </div>
  </div>

  <template #footer>
    <Button 
      label="Cancel" 
      icon="pi pi-times" 
      @click="showUpdateDialog = false" 
      class="p-button-text"
      severity="danger"
    />
    <Button 
      label="Update" 
      icon="pi pi-check" 
      @click="updateSelectedItem"
      autofocus
      :loading="updatingItem"
    />
  </template>
</Dialog>
    <!-- Request Item Dialog -->
    <Dialog 
      v-model:visible="showRequestDialog" 
      :style="{ width: '450px' }" 
      header="Request Item"
      :modal="true"
    >
      <div class="p-fluid">
        <div class="field">
          <label for="selectedItem">Selected Item </label>
          <InputText 
            id="selectedItem"
            :value="selectedItems?.model"
            readonly
            class="mt-2"
          />
        </div>
        <br/>
        <div class="field mt-4">
          <label for="quantity">Quantity </label>
          <InputNumber 
            id="quantity"
            v-model="requestForm.quantity"
            :min="1"
            :max="selectedItems?.quantity || 1"
            showButtons
            class="mt-2"
          />
        </div>
        <br/>
        <div class="field mt-4">
          <label for="class">Class </label>
          <div class="flex gap-2 mt-2">
            <Select 
              v-model="requestForm.class_prefix"
              :options="classPrefixes"
              placeholder="Cohort"
              class="flex-1"
            />
            <Select 
              v-model="requestForm.class_number"
              :options="classNumbers"
              placeholder="Group"
              class="flex-1"
            />
          </div>
        </div>
        <br/>
        <div class="field mt-4">
          <label for="studentEmail">Student Email </label>
          <InputText 
            id="studentEmail"
            v-model="requestForm.student_email"
            :placeholder="userEmail"
            class="mt-2"
          />
        </div>
      </div>

      <template #footer>
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          @click="showRequestDialog = false" 
          class="p-button-text"
          severity="danger"
        />
        <Button 
          label="Submit Request" 
          icon="pi pi-check" 
          @click="submitRequest" 
          autofocus
          :loading="submittingRequest"
        />
      </template>
    </Dialog>
    <!-- confirmation dialog -->
     <!-- Confirmation Dialog Component -->
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
    <!-- Request unavailable Item Dialog -->
<Dialog 
  v-model:visible="showMissingDialog" 
  :style="{ width: '600px' }" 
  header="Request an Unavailable Item"
  :modal="true"
>
  <div class="flex flex-wrap gap-4 p-fluid">
    
    <div class="flex-order-1 w-full">
      <label for="modelName" class="font-bold block mb-2">Model Name or Reference   </label>
      <InputText 
        id="modelName"
        v-model="missingrequestForm.model"
        placeholder="e.g. Raspberry Pi 4"
      />
    </div>
    <br/>

    <div class="flex-order-2 w-full">
      <label for="description" class="font-bold block mb-2">Description </label>
      <InputText 
        id="description"
        v-model="missingrequestForm.description"
        placeholder="Short description"
      />
    </div>
    <br/>
    <div class="flex-1 min-w-[200px]">
      <label for="quantity" class="font-bold block mb-2">Quantity </label>
      <InputNumber 
        id="quantity"
        v-model="missingrequestForm.quantity"
        :min="1"
        showButtons
      />
    </div>
    <br/>
    <div class="flex-1 min-w-[200px]">
      <label for="studentEmail" class="font-bold block mb-2">Student Email </label>
      <InputText 
        id="studentEmail"
        v-model="missingrequestForm.student_email"
        :placeholder="userEmail"
      />
    </div>
    <br/>
    <div class="w-full">
      <label class="font-bold block mb-2">Class </label>
      <div class="flex gap-2">
        <br/>
        <Select 
          v-model="missingrequestForm.class_prefix"
          :options="classPrefixes"
          placeholder="Cohort"
          class="flex-1"
        />
        <Select 
          v-model="missingrequestForm.class_number"
          :options="classNumbers"
          placeholder="Group"
          class="flex-1"
        />
      </div>
    </div>

  </div>

  <template #footer>
    <Button label="Cancel" icon="pi pi-times" @click="showMissingDialog = false" class="p-button-text" severity="danger"/>
    <Button 
      label="Submit Request" 
      icon="pi pi-check" 
      @click="submitMissing" 
      :loading="submittingMissingRequest"
    />
  </template>
</Dialog>
    <!-- Add Item Dialog (Admin only) -->
    <Dialog 
      v-if="userRole === 'admin'"
      v-model:visible="showAddDialog" 
      :style="{ width: '500px' }" 
      header="Add New Item"
      :modal="true"
    >
      <div class="p-fluid">
        <div class="field">
          <label for="itemName">Model Name </label>
          <InputText id="itemName" v-model="newItem.model" class="mt-2" />
        </div>
        <br/>
        <div class="field mt-4">
          <label for="itemStatus">Description </label>
          <InputText id="itemStatus" v-model="newItem.description" class="mt-2" />
        </div>
        <br/>
        <div class="field mt-4">
          <label for="itemQuantity">Quantity </label>
          <InputNumber 
            id="itemQuantity"
            v-model="newItem.quantity"
            :min="0"
            class="mt-2"
          />
        </div>
      </div>  
      <br/>
      <div class="field mt-4">
        <label for="itemStatus">Location </label>
        <InputText id="itemStatus" v-model="newItem.location" class="mt-2" />
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
          label="Add Item" 
          icon="pi pi-check" 
          @click="addNewItem" 
          autofocus
          :loading="addingItem"
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
const inventoryItems = ref([])
const columns = ref([])
const loading = ref(false)
const selectedItems = ref(null) // Changed to null for single selection
const searchQuery = ref('')

// Dialog states
const showRequestDialog = ref(false)
const showAddDialog = ref(false)
const submittingRequest = ref(false)
const addingItem = ref(false)
const showMissingDialog = ref(false)
const submittingMissingRequest = ref(false)
const showUpdateDialog = ref(false)
const updatingItem = ref(false)
// Confirmation dialog state
const showConfirmDialog = ref(false)
const confirmLoading = ref(false)
const confirmActionType = ref('') // 'delete' or 'update'
const confirmMessage = ref('')
const confirmSeverity = ref('danger')
const confirmCallback = ref(null)
// Request form
const requestForm = ref({
  model_id: '',
  student_email: '',
  class_prefix: '',
  class_number: null,
  quantity: 1
})
const missingrequestForm = ref({
  model: '',
  model_description: '',
  student_email: '',
  class_prefix: '',
  class_number: null,
  quantity: 1
})

onMounted(() => {
  loadData()
  resetRequestForm()
  resetMissingRequestForm() 
})
// New item form (for admin)
const newItem = ref({
  model: '',
  description: '',
  quantity: 0,
  location: '',
  status: 'available'
})

// Options
const classPrefixes = ref(['Freshman', 'Sophomore RE','Sophomore CSE','Junior RE', 'Junior CSE','Senior RE', 'Senior CSE', 'Final Year RE', 'Final Year CSE'])
const classNumbers = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
const statusOptions = ref(['available', 'reserved', 'maintenance', 'broken'])

// Computed properties
const userEmail = computed(() => user.value?.email || '')
const userRole = computed(() => user.value?.role || 'student')
const selectedItemName = computed(() => {
  if (!selectedItems.value) return 'No item selected'
  const item = selectedItems.value
  return item.name || item.model || item.item_name || `Item ${item.id}`
})

// Stats
const totalItems = computed(() => inventoryItems.value.length)
const lowStockItems = computed(() => inventoryItems.value.filter(item => item.quantity < 10).length)
const outOfStockItems = computed(() => inventoryItems.value.filter(item => item.quantity === 0).length)

// Filter items based on search
const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) {
    return [...inventoryItems.value].sort((a, b) => (a.id || 0) - (b.id || 0))
  }
  
  const searchTerm = searchQuery.value.toLowerCase().trim()
  return inventoryItems.value.filter(item => {
    return Object.values(item).some(value => {
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchTerm)
    })
  }).sort((a, b) => (a.id || 0) - (b.id || 0))
})
const resetMissingRequestForm = () => {
  missingrequestForm.value = {
    model: '',
    description: '',
    student_email: userEmail.value,
    class_prefix: '',
    class_number: null,
    quantity: 1
  }
}
// Load data
const loadData = async () => {
  loading.value = true
  try {
    const response = await fetch(apiUrl + '/inventory/', {
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
      inventoryItems.value = data.data.sort((a, b) => (a.id || 0) - (b.id || 0))
      
      if (data.data.length > 0) {
        const firstItem = data.data[0]
        columns.value = Object.keys(firstItem).map(key => ({
          field: key,
          header: formatHeader(key)
        }))
      }
      
      toast.add({
        severity: 'success',
        summary: 'Data Loaded',
        detail: `Loaded ${data.data.length} inventory items`,
        life: 3000
      })
    } else {
      throw new Error(data.message || 'Failed to load data')
    }
  } catch (error) {
    console.error('Error loading data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to load inventory data',
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

// Submit request
const submitRequest = async () => {
  if (!selectedItems.value) {
    toast.add({
      severity: 'warn',
      summary: 'No Item Selected',
      detail: 'Please select an item first',
      life: 3000
    })
    return
  }

  if (!requestForm.value.class_prefix || !requestForm.value.class_number) {
    toast.add({
      severity: 'warn',
      summary: 'Class Required',
      detail: 'Please select both class prefix and number',
      life: 3000
    })
    return
  }

  if (requestForm.value.quantity < 1) {
    toast.add({
      severity: 'warn',
      summary: 'Invalid Quantity',
      detail: 'Quantity must be at least 1',
      life: 3000
    })
    return
  }

  submittingRequest.value = true
  
  const requestData = {
    model_id: selectedItems.value.id,
    student_email: requestForm.value.student_email || userEmail.value,
    class_name: `${requestForm.value.class_prefix} G${requestForm.value.class_number}`,
    quantity: requestForm.value.quantity
  }

  try {
    const response = await fetch(apiUrl + '/requests/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.success) {
      toast.add({
        severity: 'success',
        summary: 'Request Submitted',
        detail: 'Your request has been submitted successfully',
        life: 3000
      })
        window.dispatchEvent(new CustomEvent('cart-updated', { 
    detail: { 
      type: 'item',
      itemId: selectedItems.value.id,
      itemName: selectedItems.value.name 
    }
  })) 
      showRequestDialog.value = false
      resetRequestForm()
    } else {
      throw new Error(data.message || 'Failed to submit request')
    }
  } catch (error) {
    console.error('Error submitting request:', error)
    toast.add({
      severity: 'error',
      summary: 'Request Failed',
      detail: error.message || 'Failed to submit request',
      life: 5000
    })
  } finally {
    submittingRequest.value = false
  }
}
const submitMissing = async () => {
  console.log("data"+ missingrequestForm.value);
  // Validation
  if (!missingrequestForm.value.model?.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Model Name Required',
      detail: 'Please enter a model name or reference',
      life: 3000
    })
    return
  }

  if (!missingrequestForm.value.class_prefix || !missingrequestForm.value.class_number) {
    toast.add({
      severity: 'warn',
      summary: 'Class Required',
      detail: 'Please select both class cohort and group',
      life: 3000
    })
    return
  }

  if (missingrequestForm.value.quantity < 1) {
    toast.add({
      severity: 'warn',
      summary: 'Invalid Quantity',
      detail: 'Quantity must be at least 1',
      life: 3000
    })
    return
  }

  submittingMissingRequest.value = true
  
  // Prepare data matching backend expectations
  const requestData = {
    model: missingrequestForm.value.model?.trim(),  
    model_description: missingrequestForm.value.description?.trim(),
    student_email: missingrequestForm.value.student_email?.trim() || userEmail.value,
    class_name: `${missingrequestForm.value.class_prefix} G${missingrequestForm.value.class_number}`, // This matches backend's class_name
    quantity: missingrequestForm.value.quantity
  }

  console.log('Sending to backend:', requestData) // Debug log

  try {
    const response = await fetch(apiUrl + '/missing/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(requestData)
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`)
    }
    
    if (data.success) {
      toast.add({
        severity: 'success',
        summary: 'Request Submitted',
        detail: 'Your request for an unavailable item has been submitted successfully',
        life: 3000
      })
      
      // Close the dialog
      showMissingDialog.value = false
      window.dispatchEvent(new CustomEvent('cart-updated', { 
  detail: { 
    type: 'missing-item',
    model_name: missingrequestForm.value.model.trim(),
    quantity: missingrequestForm.value.quantity
  }
}))
      
      // Reset the form
      resetMissingRequestForm()
    } else {
      throw new Error(data.message || data.error || 'Failed to submit request')
    }
  } catch (error) {
    console.error('Error submitting missing item request:', error)
    toast.add({
      severity: 'error',
      summary: 'Request Failed',
      detail: error.message || 'Failed to submit request for unavailable item',
      life: 5000
    })
  } finally {
    submittingMissingRequest.value = false
  }
}
// Update selected item (admin only) - Main function
const updateSelectedItem = () => {
  if (!selectedItems.value) {
    toast.add({
      severity: 'warn',
      summary: 'No Item Selected',
      detail: 'Please select an item to update',
      life: 3000
    })
    return
  }

  const itemName = selectedItems.value.model || selectedItems.value.name || 'this item'
  
  showConfirmation(
    'update',
    `Are you sure you want to update "${itemName}"?`,
    'warning',
    performUpdate
  )
}

// Actual update logic
const performUpdate = async () => {
  updatingItem.value = true
  
  try {
    const itemId = selectedItems.value.id
    
    // Create a clean update object
    const updateData = {
      model: selectedItems.value.model,
      description: selectedItems.value.description || '',
      quantity: selectedItems.value.quantity || 0,
      location: selectedItems.value.location || '',
      status: selectedItems.value.status || 'available'
    }
    
    const response = await fetch(`${apiUrl}/inventory/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      toast.add({
        severity: 'success',
        summary: 'Item Updated',
        detail: 'Item has been updated successfully',
        life: 3000
      })
      
      // Update the local data
      const index = inventoryItems.value.findIndex(item => item.id === itemId)
      if (index !== -1) {
        inventoryItems.value[index] = { ...inventoryItems.value[index], ...updateData }
      }
      
      showUpdateDialog.value = false
    } else {
      throw new Error(data.message || 'Failed to update item')
    }
  } catch (error) {
    console.error('Error updating item:', error)
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: error.message || 'Failed to update item',
      life: 5000
    })
    throw error // Re-throw to handle in confirmation dialog
  } finally {
    updatingItem.value = false
  }
}
const openUpdateDialog = () => {
  if (!selectedItems.value) {
    toast.add({
      severity: 'warn',
      summary: 'No Item Selected',
      detail: 'Please select an item first',
      life: 3000
    })
    return
  }
  showUpdateDialog.value = true
}

// Delete selected item (admin only)
const deleteSelectedItem = () => {
  if (!selectedItems.value) {
    toast.add({
      severity: 'warn',
      summary: 'No Item Selected',
      detail: 'Please select an item to delete',
      life: 3000
    })
    return
  }

  
  showConfirmation(
    'delete',
    `  Are you sure you want to delete This Item ?`,
    'danger',
    async () => {
      const itemId = selectedItems.value.id
      
      try {
        const response = await fetch(`${apiUrl}/inventory/${itemId}`, {
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
            summary: 'Item Deleted',
            detail: 'Item has been deleted successfully',
            life: 3000
          })
          loadData()
          selectedItems.value = null
        } else {
          throw new Error(data.message || 'Failed to delete item')
        }
      } catch (error) {
        console.error('Error deleting item:', error)
        toast.add({
          severity: 'error',
          summary: 'Delete Failed',
          detail: error.message || 'Failed to delete item',
          life: 5000
        })
        throw error // Re-throw to handle in confirmation dialog
      }
    }
  )
}
// Reset forms
const resetRequestForm = () => {
  requestForm.value = {
    model_id: '',
    student_email: userEmail.value,
    class_prefix: '',
    class_number: null,
    quantity: 1
  }
}

const resetNewItemForm = () => {
  newItem.value = {
    name: '',
    description: '',
    quantity: 0,
    location: '',
    status: 'available'
  }
}

// Initialize request form with user email
onMounted(() => {
  loadData()
  resetRequestForm()
})

// Handle search
const handleSearch = () => {
  // Optional: Add debounce here if needed
}

// Helper functions
const formatHeader = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

const getQuantitySeverity = (quantity) => {
  if (quantity === 0) return 'danger'
  if (quantity < 10) return 'warning'
  if (quantity < 20) return 'info'
  return 'success'
}

const getStatusSeverity = (status) => {
  switch (status?.toLowerCase()) {
    case 'available': return 'success'
    case 'reserved': return 'warning'
    case 'maintenance': return 'info'
    case 'broken': return 'danger'
    default: return null
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
/* ... keep your existing styles exactly as they are ... */
.home {
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

.home .page-header {
  margin-bottom: 16px;
}

.home .toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.home .content-wrapper {
  gap: 16px;
}

.home .table-section {
  padding: 16px;
}

.home .sidebar-actions {
  padding: 16px;
}

.home table {
  margin-top: 8px;
}

.home .pagination {
  margin-top: 12px;
}

.home .summary-section {
  margin-top: 16px;
}

.home .toolbar {
  margin-bottom: 24px;
}

.home .sidebar-actions button,
.home .sidebar-actions .btn,
.home .sidebar-actions .action-button {
  margin-bottom: 10px;
}

.home .sidebar-actions button:last-child,
.home .sidebar-actions .btn:last-child,
.home .sidebar-actions .action-button:last-child {
  margin-bottom: 0;
}

.space-y-3{
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
</style>