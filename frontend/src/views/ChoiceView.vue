<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import type Event from '@/types/event';
import Loader from '@/components/Loader.vue';

const events = ref([] as Event[]);
const loadedEvents = ref(false)

onBeforeMount(() => {
    fetch('/api/events')
        .then(response => response.json())
        .then(data => {
            events.value = data.map((event: any) => (<Event>{
                ...event,
                id: event._id
            }));
            setTimeout(() => {
                loadedEvents.value = true
            }, 1000)
        })
})


</script>

<template>
    <div id="choice-wrapper">
        <h2>Choix de l'évènement</h2>
        <div id="events-list" v-if="loadedEvents">
            <div class="event" v-for="event in events" :key="event.id" v-if="events.length > 0">
                <h3>{{ event.display_name }}</h3>
                <p>{{ event.id }}</p>
            </div>
            <div v-else>
                <p>Aucun évènement disponible</p>
            </div>
        </div>
        <Loader v-else />
    </div>
</template>

<style scoped>
#choice-wrapper {
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
</style>