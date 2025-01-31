<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header>
    <h1>Association des amis du Littoral</h1>
  </header>

  <RouterView />
</template>

<style scoped>
  header {
    height: 15%;
    width: 100%;

    background-color: rgb(44, 123, 168);
    color: white;

    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
