<script setup lang="ts">
import { RouterLink } from 'vue-router'
import '@fontsource/krona-one';
import '@fontsource/lexend';
import { ChevronRight } from 'lucide-vue-next';
import Mention from '@/components/Mention.vue';
</script>

<template>
    <div id="hero-landing">
        <h1>Résolution d'un bug en cours</h1>
        <h2>Réouverture prévue d'ici 24h</h2>
    </div>
    <Mention />
</template>

<style scoped>
#hero-landing {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    height: 50%;
    width: 60%;
    color: #fff;
    font-size: 1rem;
    text-align: center;
}

#hero-landing h1 {
    font-family: 'Krona One', sans-serif;
    font-size: 3rem;
}

#hero-landing h2 {
    font-family: 'Lexend', sans-serif;
    font-size: 2rem;
}

</style>