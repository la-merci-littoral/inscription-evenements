<script setup lang="ts">

import '@fontsource/krona-one';
import '@fontsource/orienta';
import { usePersonStore } from '@/stores/person';
var person = usePersonStore();
import { onBeforeMount, onMounted, ref } from 'vue';

const priceCat = ref(person.bestPriceCategory)

function validateForm() {
  const inputs = document.querySelectorAll('#info-form input');
  let isValid = true;
  inputs.forEach(input => {
    if (!input.classList.contains('valid')) {
      isValid = false;
    }
  });
  if (isValid) {
    document.querySelector('button[type="submit"]')!.classList.add('activated');
  } else {
    document.querySelector('button[type="submit"]')!.classList.remove('activated');
  }
}

onMounted(() => {
  const inputs = document.querySelectorAll('#info-form input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      var regexToTest = new RegExp('');
      switch (input.id) {
        case "phone":
          regexToTest = /(0|(\+33[\s]?([0]?|[(0)]{3}?)))[1-9]([-. ]?[0-9]{2}){4}/;
          break;
        case "attendants":
          regexToTest = /\d/
          break;
        default:
          regexToTest = /\p{L}/u; // For all the others
          break;
      }
      if ((input as HTMLInputElement).value.match(regexToTest)) {
        input.classList.remove('invalid');
        input.classList.add('valid');
      } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
      }
      validateForm();
    });
  });
  inputs.forEach(input => {
    input.dispatchEvent(new Event('input'));
  });
  validateForm();
})

</script>

<template>
  <div id="info-wrapper">
    <h2 :class="{ onlytitle: person.member_id == 0 }">Informations personnelles</h2>
    <h4 id="member-data" v-if="person.member_id > 0">Vos données ont été chargées car vous êtes adhérent</h4>
    <div id="info-form">
      <div v-for="field in person.selectedEvent.info_fields">
        <label for="name" v-if="field == 'name'" :key="field">
          Prénom
          <input type="text" id="name" name="name" required v-model="person.name">
        </label>
  
        <label for="surname" v-if="field == 'surname'">
          Nom
          <input type="text" id="surname" name="surname" required v-model="person.surname">
        </label>
  
        <label for="email" v-if="field == 'email'">
          Email
          <input type="email" id="email" name="email" required v-model="person.email">
        </label>
  
        <label for="phone" v-if="field == 'phone'">
          Téléphone
          <input type="tel" id="phone" name="phone" required v-model="person.phone">
        </label>

        <label for="attendants" v-if="field == 'attendants'">
          Accompagnants
          <input type="tel" id="attendants" name="attendants" required :value="person.attendants - 1" @input="person.attendants = ($event.target as HTMLInputElement)?.value ? parseInt(($event.target as HTMLInputElement).value) + 1 : 1">
        </label>
      </div>
    </div>
    <h4 id="category-sentence">Vous êtes en catégorie "{{ priceCat.display }}" ({{ priceCat.price }} €)</h4>
    <RouterLink to="/paiement"><button type="submit">Continuer</button></RouterLink>
  </div>
</template>

<style scoped>
  #info-wrapper {
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
    margin-bottom: 5px;
  }

  h2.onlytitle {
    margin-bottom: 20px;
  }

  h4 {
    font-family: 'Orienta', sans-serif;
    text-align: center;
  }

  h4#member-data {
    margin-bottom: 20px;
    margin-top: 0px;
  }

  #info-form {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    column-gap: 4vw;
    row-gap: 20px;
    grid-auto-flow: column;
    font-family: 'Orienta', sans-serif;
  }

  #info-form:has(div:nth-child(2)) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
  }

  #info-form:has(div:nth-child(3)) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(auto-fit, minmax(0, 1fr));
  }

  #info-form label {
    font-weight: bold;
  }

  #info-form input {
    margin-top: 5px;
    display: block;
    padding: 10px;
    border: 2px solid #0050a4;
    border-radius: 5px;
  }

  #info-form input:focus {
    outline: none;
  }

  #info-form input.valid {
    border-color: #5de15d;
  }

  #info-form input.invalid {
    border-color: #e62727;
  }

  #info-wrapper p {
    font-size: 110%;
    font-family: 'Orienta', sans-serif;
    margin-top: 15px;
  }

  button[type="submit"] {
    font-family: 'Orienta', sans-serif;
    margin-top: 15px;
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
