<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import type Event from '@/types/event';
import Loader from '@/components/Loader.vue';
import { usePersonStore } from '@/stores/person';
import router from '@/router';

import { Calendar, MapPin } from 'lucide-vue-next';

const person = usePersonStore();

const events = ref([] as Event[]);
const loadedEvents = ref(false)

onBeforeMount(() => {
    fetch('/api/events')
        .then(response => response.json())
        .then(data => {
            events.value = data.map((event: any) => {
                (event.price_categories as Event["price_categories"]).sort((a, b) => {
                    if (a.type === 'default') return 1;
                    if (b.type === 'default') return -1;
                    return a.price - b.price;
                });
                return {
                    ...event,
                    id: event._id
                }
            });
            sessionStorage.setItem('events', JSON.stringify(events.value));
            setTimeout(() => {
                loadedEvents.value = true
            }, 1000)
        })
})

function chooseEvent(eventId: string) {
    person.event_id = eventId;
    const selectedEvent = events.value.find(event => event.id === eventId);
    if (selectedEvent) {
        console.log(selectedEvent)
        if (selectedEvent.price_categories.length > 1){
            router.push('/statut')
        } else {
            person.price_category = 'default';
            router.push('/mes-informations')
        }
    }
}


</script>

<template>
    <div id="choice-wrapper">
        <h2>Choix de l'évènement</h2>
        <div id="events-list" v-if="loadedEvents">
            <div class="event" v-for="event in events" :key="event.id" v-if="events.length > 0" @click="chooseEvent(event.id)">
                <h3>{{ event.display_name }}</h3>
                <div class="info-section">
                    <div class="info-item">
                        <Calendar :size="24" />
                        <p>{{ new Date(event.date_start).toLocaleString("fr-FR") }}</p>
                    </div>
                    <div class="info-item">
                        <MapPin :size="24" />
                        <p>{{ event.location }}</p>
                    </div>
                </div>
                <div class="section-separator"></div>
                <div class="prices-section" v-if="event.price_categories.length > 1">
                    <div class="info-item" v-for="price_category in event.price_categories" :key="price_category.type">
                        <p>{{ price_category.display }} :</p>
                        <p>{{ price_category.price }} €</p>
                    </div>
                </div>
                <div class="prices-section" v-else>
                    <div class="info-item">
                        <p>Prix unique :</p>
                        <p>{{ event.price_categories[0].price }} €</p>
                    </div>
                </div>
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

div#events-list {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    gap: 15px;
    font-family: 'Lexend', sans-serif;
}

div.event {
    padding: 20px;
    border: 1px white solid;
    border-radius: 10px;
    width: 100%;
    display: grid;
    grid-template-columns: 3fr 2px 2fr;
    grid-template-rows: auto auto;
    grid-auto-flow: column;
    gap: 20px;
    transition: background-color 0.3s ease;
}

div.event:hover {
    background-color: #49959f;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

div.event h3, div.event p{
    margin: 0;
}

div.event h3 {
    grid-column: span 3;
}

.info-section, .prices-section {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    gap: 10px;
}

.info-item {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
}

.section-separator {
    width: 2px;
    background-color: white;
}

</style>