<script setup lang="ts">
import { ref } from 'vue';
import { usePersonStore } from '@/stores/person';
import { Download } from 'lucide-vue-next';
import Loader from '@/components/Loader.vue';
const person = usePersonStore();

const isDownloading = ref(false)

function downloadTicket() {
    const { jwt: token, booking_id } = JSON.parse(decodeURIComponent(document.cookie.replace(/(?:(?:^|.*;\s*)ticket_info\s*\=\s*([^;]*).*$)|^.*$/, "$1")));
    isDownloading.value = true;
    fetch('/api/ticket/'+booking_id, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
        }
    }).then(async (response) => {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "Ticket " + booking_id + " - " + person.surname + ".pdf";
        document.body.appendChild(a);
        setTimeout(() => {
            a.click();
            window.URL.revokeObjectURL(url);
            isDownloading.value = false;
            localStorage.removeItem('person')
        }, 1000)
    }).catch((error) => {
        console.error('Error downloading ticket:', error);
    })
}

</script>

<template>
    <div id="confirmation-wrapper">
        <h2>Confirmation</h2>
        <p>Merci pour votre inscription {{ person.fullName }} !</p>
        <div id="download-ticket" @click="downloadTicket" v-if="!isDownloading">
            <Download :size="24" />
            <span>Télécharger mon ticket</span>
        </div>
        <div id="download-ticket" v-else>
            <Loader />
        </div>
        <p id="email-info">
            Vous allez recevoir un email avec votre ticket à l'adresse suivante : <span style="font-style: italic;">{{ person.email }}</span>
            <br>
            <span id="junk-warning">Pensez à vérifier vos spams !</span>
        </p>
        <p id="session-end">Cette session s'est vidée, vous pouvez à présent fermer l'onglet ou la fenêtre.</p>
    </div>
</template>

<style scoped>

#confirmation-wrapper {
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

p {
    font-family: 'Lexend', sans-serif;
    text-align: center;
    margin-bottom: 2px;
    font-size: 120%;
}

div#download-ticket {
    padding: 20px;
    border-radius: 25px;
    background-color: #1d338f;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    gap: 15px;
    margin-top: 25px;
    font-family: 'Lexend', sans-serif;
    transition: background-color ease-in .1s;
    width: 220px;
    height: 4vh;
}

div#download-ticket:hover {
    background-color: #1d4e6a;
    transition: background-color ease-in .1s;
}

p#email-info {
    font-size: 110%;
    width: 80%;
    max-width: 600px; /* Added to limit the width */
}

span#junk-warning {
    font-size: 90%;
}

p#session-end {
    font-size: 90%;
    margin-top: 30px;
    font-style: italic;
}

</style>

<style>
.spinner {
    height: 70%!important;
}
</style>