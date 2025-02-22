<script setup lang="ts">
</script>

<template>
  <div id="mobile-wrapper">
    <div id="mobile-disclaimer">
      <p style="font-size: 130%;">Ce site est mal adapté aux appareil mobiles</p>
      <p>Merci de procéder à l'inscription sur un ordinateur</p>
    </div>
  </div>
</template>

<style scoped>
#mobile-wrapper {
  height: 100%;
  width: 100%;
  background-color: #82cdff;
  display: flex;
  justify-content: center;
  align-items: center;
}

#mobile-disclaimer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #31749e;
  color: white;
  border-radius: 25px;
  padding: 1rem;
  width: 70%;
}

p {
  font-family: 'Lexend', sans-serif;
  color: white;
  text-align: center;
}
</style>