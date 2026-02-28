import Lara from '@primevue/themes/lara';

export default defineNuxtConfig({
  // Modules
  modules: [
    '@pinia/nuxt',
    '@primevue/nuxt-module'
  ],
  
  // PrimeVue configuration
  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: Lara,
        options: {
          prefix: 'p',
          darkModeSelector: 'false', 
          cssLayer: false
        }
      }
    },
    composables: {
      include: ['useToast', 'usePrimeVue']
    },
    directives: {
      include: ['Tooltip']
    },
    components: {
      include: ['Button', 'Avatar', 'Toast', 'InputText', 'InputNumber', 'Textarea', 'Select', 'Dialog', 'Badge', 'ProgressSpinner', 'Tag']
    }
  },
  
  // Runtime config
  runtimeConfig: {
    // Private keys (Server-side only)
    MAGIC_SECRET_KEY: process.env.MAGIC_SECRET_KEY,
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',

    public: {
      API_URL: process.env.API_URL || 'http://localhost:4000/api',
      STATUS_CHECK_URL: process.env.STATUS_CHECK_URL || 'http://localhost:4000/',
      MAGIC_ENABLED: process.env.VITE_MAGIC_ENABLED || 'true',
      MAGIC_PUBLISHABLE_KEY: process.env.VITE_MAGIC_PUBLISHABLE_KEY || ''
    }
  },
  
  app: {
    head: {
      title: 'FabLab Inventory Manager',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  
  // Build and Nitro fixes for Magic SDK
  build: {
    transpile: ['primevue', '@magic-sdk/admin'],
  },

  nitro: {
    // IMPORTANT: 'vercel-edge' does not support Node.js built-ins required by Magic Admin.
    // If you need Magic Admin, use 'vercel' or remove this line to use the default.
    preset: 'vercel', 
    plugins: ['@/server/index'],
    externals: {
      inline: ['@magic-sdk/admin']
    }
  },
  
  compatibilityDate: '2024-04-03',
  pages: true,
  devtools: { enabled: true },
  ssr: false
});