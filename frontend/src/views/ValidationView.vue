<script setup lang="ts">

import Loader from '@/components/Loader.vue';
import router from '@/router';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { usePersonStore } from '@/stores/person';
const route = useRoute();
const validationError = ref(false);
const person = usePersonStore()

onMounted(() => {
    const validationPoller = setInterval(() => {
        fetch(`/api/validate?pi=${route.query.payment_intent}&id=${person.$state.booking_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(async (response) => {
                setTimeout(async () => {
                    clearInterval(validationPoller);
                    if (response.status === 200) {
                        localStorage.setItem('ticket_info', JSON.stringify(await response.json() as { jwt: string; booking_id: string; }));
                        router.push({ path: '/confirmation' });
                    }
                }, 1500);
            })
    }, 1000);
    setTimeout(() => {
        clearInterval(validationPoller);
        validationError.value = true;
    }, 15000);
});

</script>

<template>
    <div id="validation-wrapper">
        <h2>Validation en cours</h2>
        <Loader v-if="!validationError"/>
        <h4 v-if="validationError">Une erreur est survenue lors de la validation de votre inscription<br>Cliquez sur le bouton d'aide ci-dessous</h4>
    </div>
</template>

<style scoped>

#validation-wrapper {
    padding: 20px 40px;
    border-radius: 25px;
    color: white;
    background-color: #2c7ba8;
    border: 2px solid #1d338f;

    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
}

h2 {
    font-family: 'Krona One', sans-serif;
    text-align: center;
    margin-bottom: 20px;
}

h4 {
    font-family: 'Lexend', sans-serif;
    text-align: center;
    margin-top: 20px;
    color: rgb(231, 119, 119);
}

</style>