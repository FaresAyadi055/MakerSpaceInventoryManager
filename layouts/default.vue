<template>
  <div>
    <Navbar />
    <Toast />
    <slot />
    <Footer />
  </div>
</template>

<script setup>
import Navbar from '~/components/Navbar.vue'
import Footer from '~/components/Footer.vue'
import Toast from 'primevue/toast';
</script>