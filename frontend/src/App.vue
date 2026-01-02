<!-- src/App.vue -->
<template>
  <RouterView />
  <Footer />
</template>

<script setup>
import { RouterView } from 'vue-router'
import Footer from './components/Footer.vue';
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