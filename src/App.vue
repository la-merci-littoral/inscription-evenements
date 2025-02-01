<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import '@fontsource/lexend';
// import Logo from '@/assets/logo.svg?url'
import Logo from '@/assets/placeholder_rdle.png'
</script>

<template>
  <main>
    <div id="header-wrapper">
      <header>
        <img :src="Logo" alt="Logo de l'association">
        <h1>Association des Amis du Littoral</h1>
      </header>
    </div>
    <div id="main-wrapper">
      <RouterView />
    </div>
  </main>
</template>

<style scoped>

  main {
    height: 100%;
    width: 100%;
    background-color: #68c2ff;

    display: grid;
    grid-template-columns: 0.8fr 1fr;
    justify-content: center;
    align-items: center;
  }

  #header-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    border-radius: 25px;
    padding: 3rem;
    background-color: #2c7ba8;
    color: #fff;
    max-width: 60%;
    box-shadow: 8px 8px 16px 0px rgb(0 55 91 / 75%);
  }

  header img {
    max-width: 75%;
  }

  header h1 {
    font-family: 'Lexend', sans-serif;
    font-size: 3rem;
    text-align: center;
    margin-top: 4rem;
  }

  #main-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  
</style>
