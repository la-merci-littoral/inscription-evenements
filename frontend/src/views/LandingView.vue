<script setup lang="ts">
import { RouterLink } from 'vue-router'
import '@fontsource/krona-one';
import '@fontsource/lexend';
import { ChevronRight } from 'lucide-vue-next';
</script>

<template>
  <div id="hero-landing">
    <div id="big-landing-text">Evènements</div>
    <RouterLink to="/choix">
      <button>
        Je m'inscris !
        <ChevronRight />
      </button>
    </RouterLink>
  </div>
</template>

<style scoped>
#hero-landing {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  height: 50%;
  width: 90%;
  color: #fff;
  font-size: 1rem;
  text-align: center;
}

#big-landing-text {
  font-family: 'Krona One', sans-serif;
  font-size: 6rem;
}

#hero-landing button {
  font-size: 2rem;
  background-color: #2c7ba8;
  border: none;
  padding: 20px;
  border-radius: 25px;
  color: #fff;
  animation: pulse 1s ease-in-out infinite;
  transition: background-color 0.2s;
  text-decoration: none;
  font-family: 'Lexend', sans-serif;
}

#hero-landing button:hover {
  background-color: #1697ec;
  cursor: pointer;
  transition: background-color 0.2s;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

</style>