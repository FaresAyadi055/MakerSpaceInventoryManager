<template>
  <div>
    <Navbar />
    <Toast />
    <NuxtPage />
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Navbar from './app/components/Navbar.vue'
import Footer from './app/components/Footer.vue'

const router = useRouter()
const toast = useToast()

onMounted(() => {
  // Check authentication status
  const token = localStorage.getItem('token')
  if (!token && router.currentRoute.value.path !== '/login') {
    router.push('/login')
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>
