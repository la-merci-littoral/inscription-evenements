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

const nearlyClosingHrs = import.meta.env.NEARLY_CLOSING_HRS
const hasClosedHrs = import.meta.env.HAS_CLOSED_HRS

async function getEvents(){
    return new Promise<null>((resolve, reject) => {
        fetch('/api/events')
            .then(response => response.json())
            .then(data => {
                events.value = data.map((event: any) => {
                    (event.price_categories as Event["price_categories"]).sort((a, b) => {
                        if (a.type === 'default') return 1;
                        if (b.type === 'default') return -1;
                        return a.price - b.price;
                    });
                    event.booking_close = new Date(event.booking_close);
                    event.booking_open = new Date(event.booking_open);
                    event.date_start = new Date(event.date_start);
                    return {
                        ...event,
                        id: event._id
                    }
                }).sort((a: Event, b: Event) => {
                    const dateComparison = new Date(a.date_start).setHours(0, 0, 0, 0) - new Date(b.date_start).setHours(0, 0, 0, 0);
                    if (dateComparison !== 0) {
                        return dateComparison;
                    }
                    return (a.order || 0) - (b.order || 0);
                });
                resolve(null)
            })
    })
}

onBeforeMount(async () => {
    await getEvents()
    setTimeout(() => {
        loadedEvents.value = true
    }, 1000)
    setInterval(getEvents, 5000)
})

function chooseEvent(eventId: string) {
    const selectedEvent = events.value.find(event => event.id === eventId);
    if (selectedEvent) {
        person.selectedEvent = selectedEvent;
        person.verifiedCategories.push(selectedEvent.price_categories.find(category => category.type === 'default')!);
        if (selectedEvent.price_categories.length > 1){
            router.push('/statut')
        } else {
            router.push('/mes-informations')
        }
    }
}


</script>

<template>
    <div id="choice-wrapper">
        <h2>Choix de l'évènement</h2>
        <div id="events-list" v-if="loadedEvents">
            <div class="event" v-for="event in events" :key="event.id" v-if="events.length > 0"
                @click="event.bookings_left > 0 || event.booking_close <= new Date() ? chooseEvent(event.id) : null"
                :class="{ 'event-disabled': event.bookings_left == 0 || event.booking_close < new Date() }">
                <h3>{{ event.display_name }}</h3>
                <div class="info-section">
                    <div class="info-item">
                        <Calendar :size="24" />
                        <p>{{ event.date_start.toLocaleString("fr-FR", { timeZone: 'Europe/Paris', hour:
                            '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) }}</p>
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
                <div class="prices-section" v-else-if="event.price_categories[0].price > 0">
                    <div class="info-item">
                        <p>Tarif unique :</p>
                        <p>{{ event.price_categories[0].price }} €</p>
                    </div>
                </div>
                <div class="prices-section" v-else>
                    <p id="free-indicator">Gratuit !</p>
                </div>
                <div class="ribbon" v-if="event.bookings_left < event.limit*0.1 && event.bookings_left > 0">
                    Plus que {{ event.bookings_left }} place{{ event.bookings_left > 1 ? "s" : ""}} !
                </div>
                <div class="ribbon" v-else
                    v-if="event.booking_close.getTime() - new Date().getTime() < nearlyClosingHrs*3600*1000">
                    Clôture imminente
                </div>
                <div class="ribbon" v-else
                    v-if="event.booking_close < new Date()">
                    Clôturé
                </div>
                <div class="ribbon" v-if="event.bookings_left == 0">Complet</div>
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
    position: relative;
}

div.event:hover {
    background-color: #49959f;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

div.event-disabled:hover {
    cursor: not-allowed;
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

#free-indicator {
    font-weight: bold;
    font-size: 20px;
    text-align: center;
}

.section-separator {
    width: 2px;
    background-color: white;
}

/* HTML: <div class="ribbon">Your text content</div> */
.ribbon {
  font-size: 17px;
  font-weight: bold;
  color: #fff;
}
.ribbon {
  --f: .4em; /* control the folded part*/
  --r: .8em; /* control the ribbon shape */
  
  position: absolute;
  top: 20px;
  right: calc(-1*var(--f));
  padding-inline: .25em;
  line-height: 1.8;
  background: #c2361d;
  border-bottom: var(--f) solid #0005;
  border-left: var(--r) solid #0000;
  clip-path: 
    polygon(var(--r) 0,100% 0,100% calc(100% - var(--f)),calc(100% - var(--f)) 100%,
      calc(100% - var(--f)) calc(100% - var(--f)),var(--r) calc(100% - var(--f)),
      0 calc(50% - var(--f)/2));
}

</style>