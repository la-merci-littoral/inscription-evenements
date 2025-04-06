<script setup lang="ts">
import { onBeforeMount, onUnmounted, ref } from 'vue'
import type Event from '@/types/event';
import { usePersonStore } from '@/stores/person';


const person = usePersonStore()
const filtered_categories = person.selectedEvent.price_categories.filter(price_category => price_category.type !== 'default');

const memberInvalid = ref(undefined as Boolean | undefined);

async function checkAge(birth: string){
    const birthDate = new Date(birth);
    const age = new Date(Date.now() - birthDate.getTime()).getUTCFullYear() - 1970;
    if (age < 18){
        if (!person.verifiedCategories.find((category) => category.type == 'minor')) {
            person.verifiedCategories.push(filtered_categories.find((category) => category.type == 'minor')!);
        }
    } else {
        person.verifiedCategories = person.verifiedCategories.filter(category => category.type !== 'minor');
    }
}

function checkMember(member_id: string){
    member_id = member_id.toString(); // Ensure member_id is treated as a string
    fetch('/api/member/' + member_id)
        .then(response => {
            if (response.status === 404){
                memberInvalid.value = true;
                person.verifiedCategories = person.verifiedCategories.filter(category => category.type !== 'member');
            } else {
                memberInvalid.value = false;
                if (!person.verifiedCategories.find((category) => category.type == 'member')) {
                    person.verifiedCategories.push(filtered_categories.find((category) => category.type == 'member')!);
                }
                return response.json();
            }
        })
        .then(data => {
            person.$patch(data);
        })
}

onBeforeMount(() => {
    if (person.member_id !== ""){
        checkMember(person.member_id);
    }
    if (person.birth !== ''){
        checkAge(person.birth as string);
    }
})
</script>

<template>
    <div id="status-wrapper">
        <h2>Vérification du statut</h2>
        <p>Cet évènement propose des tarifs différents selon certaines conditions</p>
        <div id="verifications-list">
            <div class="verif-element" v-for="price_category in filtered_categories" :key="price_category.type">
                <div class="separator"></div>
                <div class="verif-component" v-if="price_category.type === 'member'">
                    <h3>Numéro d'adhésion à l'Association des Amis du Littoral (si vous êtes adhérent)</h3>
                    <div class="component-picker">
                        <input type="number" v-model="person.member_id" min="0" max="999999" @input="checkMember(person.member_id.toString())" :class="{validated: memberInvalid == false, invalidated: memberInvalid == true}"/>
                        <!-- <span v-if="!memberInvalid">Bonjour {{ person.fullName }} !</span> -->
                    </div>
                </div>
                <div class="verif-element" v-if="price_category.type === 'minor'">
                    <h3>Date de naissance</h3>
                    <div class="component-picker">
                        <input type="date" v-model="person.birth" @input="checkAge(person.birth as string)"/>
                    </div>
                </div>
            </div>
        </div>
        <RouterLink to="/mes-informations"><button type="submit"
                :class="{ activated: filtered_categories.filter(price_category => price_category.type === 'minor').length === 0 || person.birth !== '' }">Continuer</button>
        </RouterLink>
    </div>
</template>

<style scoped>
#status-wrapper {
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

h2, #status-wrapper > p {
    font-family: 'Krona One', sans-serif;
    text-align: center;
    margin-bottom: 3px;
}

#status-wrapper > p {
    margin-bottom: 40px;
    margin-top: 2px;
    font-size: 90%;
}

#verifications-list {
    font-family: 'Lexend', sans-serif;
    font-size: 90%;
    width: 100%;
}

.verif-element {
    margin-bottom: 25px;
}

.component-picker {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 10px;
}

.component-picker input[type="date"] {
    font-family: 'Lexend', sans-serif;
    font-size: 120%;
    padding: 5px;
    border: 2px solid #d9dadd;
    border-radius: 5px;
    background-color: #2c7ba8;
    color: white;
    outline: none;
}

.component-picker input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
}

.component-picker input[type="number"] {
    font-family: 'Lexend', sans-serif;
    font-size: 120%;
    padding: 5px;
    border: 2px solid #d9dadd;
    border-radius: 5px;
    background-color: #2c7ba8;
    color: white;
    outline: none;
    width: 20%;
}

.component-picker input[type="number"]::-webkit-inner-spin-button,
.component-picker input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.component-picker input[type="number"].validated {
    border-width: 3px;
    border-color: #00d30b;
}

.component-picker input[type="number"].invalidated {
    border-color: #be131c;
}

.separator {
    width: 100%;
    height: 1px;
    background-color: white;
}

button[type="submit"] {
    font-family: 'Orienta', sans-serif;
    margin-top: 10px;
    font-size: 120%;
    padding: 10px;
    background-color: #474646;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: not-allowed;
}

button[type="submit"].activated {
    background-color: #45a049;
    cursor: pointer;
}

button[type="submit"].activated:hover {
    background-color: #45a049;
}
</style>