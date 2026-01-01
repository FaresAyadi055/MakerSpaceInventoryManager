// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// PrimeVue 4 Setup
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
// PrimeVue 4 Theme
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'

// Import PrimeVue Components
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import InputOtp from 'primevue/inputotp'
import Toast from 'primevue/toast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import MultiSelect from 'primevue/multiselect'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'


const app = createApp(App)

// Use PrimeVue with Aura theme
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,
      cssLayer: false
    }
  }
})

app.use(ToastService)
app.use(router)

// Register components
app.component('InputText', InputText)
app.component('Button', Button)
app.component('Avatar', Avatar)
app.component('InputOtp', InputOtp)
app.component('Toast', Toast)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('MultiSelect', MultiSelect)
app.component('Badge', Badge)
app.component('Tag', Tag)
app.mount('#app')