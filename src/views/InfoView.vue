<script setup lang="ts">

import '@fontsource/krona-one';
import '@fontsource/orienta';

import { onMounted } from 'vue';

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
        case "email":
          regexToTest = /\S+@\S+\.\S+/;
          break;
        case "phone":
          regexToTest = /(0|(\+33[\s]?([0]?|[(0)]{3}?)))[1-9]([-. ]?[0-9]{2}){4}/;
          break;
        case "zip":
          regexToTest = /\d{5}/;
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
});

</script>

<template>
  <div id="info-wrapper">
    <h2>Informations personnelles</h2>
    <div id="info-form">

      <label for="name">
        Prénom
        <input type="text" id="name" name="name" required>
      </label>

      <label for="surname">
        Nom
        <input type="text" id="surname" name="surname" required>
      </label>

      <label for="email">
        Email 
        <input type="email" id="email" name="email" required>
      </label>

      <label for="phone">
        Téléphone 
        <input type="tel" id="phone" name="phone" required>
      </label>

      <label for="address">
        Adresse 
        <input type="text" id="address" name="address" required>
      </label>

      <label for="zip">
        Code postal 
        <input type="text" id="zip" name="zip" required>
      </label>

      <label for="city">
        Ville 
        <input type="text" id="city" name="city" required>
      </label>

      <label for="country">
        Pays 
        <input type="text" id="country" name="country" required>
      </label>

    </div>
    <button type="submit">Valider</button>
  </div>
</template>

<style>
  #info-wrapper {
    padding: 20px;
    border-radius: 25px;
    color: white;
    background-color: #2c7ba8;

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

  #info-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
    column-gap: 5vw;
    row-gap: 20px;
    grid-auto-flow: column;
    font-family: 'Orienta', sans-serif;
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

  button[type="submit"] {
    font-family: 'Orienta', sans-serif;
    margin-top: 40px;
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
