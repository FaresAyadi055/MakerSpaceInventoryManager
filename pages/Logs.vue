<template>
  <div class="logs-view">
    <div class="main-container">
      <div class="content-wrapper">
        <div class="header-section">
          <h1 class="page-title">System Logs</h1>
          <p class="page-subtitle">Filterable audit log of system actions</p>
        </div>
        <div class="card toolbar">
          <div class="filter-row">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText
                v-model="filterUserEmail"
                placeholder="Filter by user email..."
                class="filter-input"
              />
            </span>
            <Select
              v-model="filterAction"
              :options="actionOptions"
              option-label="label"
              option-value="value"
              placeholder="All actions"
              class="filter-select"
            />
            <Button label="Apply" icon="pi pi-filter" @click="loadLogs(1)" />
            <Button label="Refresh" icon="pi pi-refresh" :loading="loading" @click="loadLogs(page)" />
          </div>
        </div>
        <div class="card">
          <DataTable
            :value="logs"
            :loading="loading"
            dataKey="id"
            :paginator="true"
            :rows="pagination.limit"
            :rowsPerPageOptions="[10, 25, 50, 100]"
            :totalRecords="pagination.total"
            :lazy="true"
            @page="onPage"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            responsiveLayout="scroll"
            class="p-datatable-sm"
          >
            <Column field="action" header="Action">
              <template #body="{ data }">
                <Tag :value="data.action" :severity="actionSeverity(data.action)" />
              </template>
            </Column>
            <Column field="userEmail" header="Actor" />
            <Column field="userRole" header="Role" />
            <Column field="timestamp" header="Timestamp">
              <template #body="{ data }">
                {{ formatDate(data.timestamp) }}
              </template>
            </Column>
            <Column header="Details">
              <template #body="{ data }">
                <span class="metadata-text">{{ metadataSummary(data.metadata) }}</span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

definePageMeta({ middleware: 'auth', requiresAuth: true })

const config = useRuntimeConfig()
const apiBase = computed(() => (config.public?.API_URL as string) || '')
function apiUrl (path: string) {
  return apiBase.value ? `${String(apiBase.value).replace(/\/$/, '')}/${path}` : `/api/${path}`
}

const toast = useToast()
const router = useRouter()
const logs = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const filterUserEmail = ref('')
const filterAction = ref<string | null>(null)
const pagination = reactive({ page: 1, limit: 50, total: 0, pages: 0 })

const actionOptions = [
  { label: 'All actions', value: null },
  { label: 'Request approve', value: 'REQUEST_APPROVE' },
  { label: 'Request decline', value: 'REQUEST_DECLINE' },
  { label: 'Request return', value: 'REQUEST_RETURN' },
  { label: 'Inventory update', value: 'INVENTORY_UPDATE' },
  { label: 'Inventory create', value: 'INVENTORY_CREATE' },
  { label: 'User create', value: 'USER_CREATE' },
  { label: 'User update', value: 'USER_UPDATE' },
]

const token = ref('')
onMounted(() => {
  token.value = typeof localStorage !== 'undefined' ? localStorage.getItem('token') || '' : ''
  const user = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {}
  if (user?.role !== 'admin' && user?.role !== 'superadmin' && user?.role !== 'instructor') {
    toast.add({ severity: 'error', summary: 'Access denied', detail: 'Technician or admin only', life: 3000 })
    router.push('/home')
    return
  }
  loadLogs(1)
})

function getHeaders () {
  return token.value ? { Authorization: `Bearer ${token.value}` } : {}
}

async function loadLogs (pageNum: number) {
  page.value = pageNum
  loading.value = true
  try {
    const query: Record<string, string> = {
      page: String(pageNum),
      limit: String(pagination.limit),
    }
    if (filterUserEmail.value?.trim()) query.userEmail = filterUserEmail.value.trim()
    if (filterAction.value) query.action = filterAction.value
    const res = await $fetch<{ success: boolean; data: any[]; pagination: any }>(apiUrl('admin/logs'), {
      query,
      headers: getHeaders() as Record<string, string>,
    })
    if (res?.success && Array.isArray(res.data)) {
      logs.value = res.data
      if (res.pagination) {
        pagination.page = res.pagination.page
        pagination.limit = res.pagination.limit
        pagination.total = res.pagination.total
        pagination.pages = res.pagination.pages
      }
    }
  } catch (e: any) {
    if (e?.statusCode === 401) {
      router.push('/login')
      return
    }
    toast.add({ severity: 'error', summary: 'Error', detail: e?.data?.message || 'Failed to load logs', life: 5000 })
  } finally {
    loading.value = false
  }
}

function onPage (event: any) {
  if (event.rows != null && event.rows !== pagination.limit) {
    pagination.limit = event.rows
    page.value = 1
  } else {
    page.value = (event.page ?? 0) + 1
  }
  loadLogs(page.value)
}

function formatDate (d: string | Date | null) {
  if (!d) return '—'
  const date = new Date(d)
  return date.toLocaleString()
}

function actionSeverity (action: string) {
  if (action?.includes('APPROVE') || action?.includes('RETURN')) return 'success'
  if (action?.includes('DECLINE') || action?.includes('DELETE')) return 'danger'
  return 'info'
}

function metadataSummary (meta: any) {
  if (!meta || typeof meta !== 'object') return '—'
  const parts = []
  if (meta.description) parts.push(meta.description)
  if (meta.itemModel) parts.push(meta.itemModel)
  if (meta.requestStatus) parts.push(meta.requestStatus)
  if (meta.quantity?.change != null) parts.push(`Δ${meta.quantity.change}`)
  return parts.length ? parts.join(' · ') : JSON.stringify(meta).slice(0, 80)
}
</script>

<style scoped>
.logs-view { min-height: 100vh; background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%); }
.main-container { padding: 1.5rem; }
.content-wrapper { max-width: 1400px; margin: 0 auto; }
.header-section { margin-bottom: 1rem; }
.page-title { font-size: 1.75rem; font-weight: 700; color: #111; margin: 0 0 0.25rem 0; }
.page-subtitle { color: #666; margin: 0; }
.toolbar { margin-bottom: 1rem; }
.filter-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.filter-input { width: 220px; }
.filter-select { width: 180px; }
.metadata-text { font-size: 0.85rem; color: #555; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; }
.card { padding: 1rem; border-radius: 12px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
</style>
