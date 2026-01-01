<!-- src/views/HomeView.vue -->
<template>
  <div class="home p-6">
    <Navbar />
    <div class="container mx-auto mt-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
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
          <span class="text-surface-700">
            Logged in as: <strong>{{ userRole }}</strong>
          </span>
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
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
          responsiveLayout="scroll"
          class="p-datatable-sm"
          sortField="id"
          :sortOrder="1"
        >
          <!-- Checkbox Selection Column -->
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          
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
      <div v-if="selectedItems.length > 0" class="mt-4 p-4 bg-primary-50 rounded-lg">
        <div class="flex justify-between items-center">
          <div>
            <span class="font-medium text-primary-900">
              {{ selectedItems.length }} item(s) selected
            </span>
            <p class="text-sm text-primary-700 mt-1">
              Total quantity: {{ totalSelectedQuantity }}
            </p>
          </div>
          <span v-if ="userRole === 'admin'">
          <Button 
            label="Clear Selection" 
            text 
            size="small"
            @click="selectedItems = []"
          /></span>
        </div>
      </div>

      <!-- Stats Cards  only for admin-->
      <div v-if="userRole === 'admin'"
      class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div class="card text-center p-6">
          <div class="text-3xl font-bold text-primary-600">{{ totalItems }}</div>
          <div class="text-surface-600 mt-2">Total Items</div>
        </div>
        <div class="card text-center p-6">
          <div class="text-3xl font-bold text-yellow-600">{{ lowStockItems }}</div>
          <div class="text-surface-600 mt-2">Low Stock</div>
        </div>
        <div class="card text-center p-6">
          <div class="text-3xl font-bold text-red-600">{{ outOfStockItems }}</div>
          <div class="text-surface-600 mt-2">Out of Stock</div>
        </div>
      </div>
    </div>

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
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import Tooltip from 'primevue/tooltip' // Add this import
import { useToast } from 'primevue/usetoast'
import Navbar from '@/components/Navbar.vue'
import { exportCSV } from '@/utils/exportCSV.js'
// Register the tooltip directive globally for this component
const vTooltip = Tooltip

const router = useRouter()
const toast = useToast()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
// State
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const inventoryItems = ref([])
const columns = ref([])
const loading = ref(false)
const selectedItems = ref([])
const searchQuery = ref('')

// Computed properties
const userEmail = computed(() => user.value?.email || 'Not available')
const userRole = computed(() => user.value?.role || 'Not available')

// Stats
const totalItems = computed(() => inventoryItems.value.length)
const lowStockItems = computed(() => inventoryItems.value.filter(item => item.quantity < 10).length)
const outOfStockItems = computed(() => inventoryItems.value.filter(item => item.quantity === 0).length)
const totalSelectedQuantity = computed(() => 
  selectedItems.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
)

// Filter items based on search
const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) {
    // When no search query, return all items sorted by ID
    return [...inventoryItems.value].sort((a, b) => (a.id || 0) - (b.id || 0))
  }
  
  const searchTerm = searchQuery.value.toLowerCase().trim()
  return inventoryItems.value.filter(item => {
    // Search across all values in the item
    return Object.values(item).some(value => {
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchTerm)
    })
  }).sort((a, b) => (a.id || 0) - (b.id || 0)) // Always sort by ID
})

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
      // Sort by ID initially
      inventoryItems.value = data.data.sort((a, b) => (a.id || 0) - (b.id || 0))
      
      // Generate columns from first item's keys
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

// Handle search (debounce optional)
const handleSearch = () => {
  // Optional: Add debounce here if needed
  // For now, just rely on computed property
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

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.container {
  max-width: 1400px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

.grid {
  display: grid;
}
.ml-4{
  margin-left: 1rem;
}
</style>