<script setup lang="ts">

import { loadStripe } from "@stripe/stripe-js"
import { StripeElement as StripeElementVue, StripeElements as StripeElementsVue } from "vue-stripe-js";
import type {
    StripeElement,
    StripeElements,
    StripeElementsOptionsMode,
    Stripe,
    StripeElementChangeEvent,
} from "@stripe/stripe-js";
import Loader from "@/components/Loader.vue";

import { usePersonStore } from "@/stores/person";

import { ref, onBeforeMount } from "vue";
import { RouterLink } from "vue-router";
import router from "@/router";

const person = usePersonStore()

const stripePk = import.meta.env.STRIPE_PK;
const stripeOptions = ref<StripeElementsOptionsMode>({
    mode: "payment",
    amount: person.bestPriceCategory.price * 100,
    currency: "eur",
    appearance: {
        theme: "flat",
        rules: {
            '.Label': {
                color: 'white',
            },
        },
        variables: {
            fontFamily: 'Lexend',
        }
    },
    locale: "fr",
    fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" }],
});
const stripeLoaded = ref(false)
const stripeRendered = ref(false)
const clientSecret = ref("")
const elementsComponent = ref()
const paymentComponent = ref()
const paymentFormComplete = ref(false)
const verifiedAmount = ref(-1) //ref(person.bestPriceCategory.price)

var userExists = ref(false)

async function sendUserData(){
    fetch("/api/booking", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(usePersonStore().$state),
        })
        .then((response) => {
            userExists.value = response.status === 409;
            return response.json();
        })
        .then((data) => {
            clientSecret.value = data.clientSecret;
            verifiedAmount.value = data.amount;
            person.$state.pi_secret = clientSecret.value
            person.$state.booking_id = data.booking_id  
        });
}

onBeforeMount(async () => {
    await sendUserData()
    if (verifiedAmount.value !== 0) {
        loadStripe(stripePk).then(() => {stripeLoaded.value = true});
    }
});

async function handleStripeRendered(){
    setTimeout(() => {
        stripeRendered.value = true
    }, 1000)
}

async function handlePaymentSubmit() {
    if (paymentFormComplete.value) {
        const stripeInstance = elementsComponent.value?.instance as Stripe
        const elements = elementsComponent.value?.elements as StripeElements

        if (stripeInstance) {
            await elements.submit()
            await stripeInstance.confirmPayment({
                elements,
                clientSecret: clientSecret.value,
                confirmParams: {
                    return_url: import.meta.env.BASE_URL + "/validation",
                },

            })
        }
    }
}

function handleNullPayment() {
    if (verifiedAmount.value !== 0){
        return
    }
    fetch("/api/payment/null", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({"booking_id": person.$state.booking_id})
    })
        .then((response) => {
            if (response.status === 200) {
                router.push("/validation?payment_intent=none&payment_intent_client_secret=none&redirect_status=succeeded");
            } else {
                console.error("Error processing null payment");
            }
        })
}

</script>

<template>
    <div id="payment-wrapper">
        <h2 v-if="!userExists">Paiement</h2>
        <form @submit.prevent="handlePaymentSubmit" :style="{ display: stripeRendered ? 'flex' : 'none' }"
            v-if="stripeLoaded && verifiedAmount > 0 && !userExists">
            <StripeElementsVue :stripe-key="stripePk" :instance-options="{}" :elements-options="stripeOptions"
                ref="elementsComponent">
                <StripeElementVue type="payment" :options="{}" ref="paymentComponent" @ready="handleStripeRendered"
                    @change="(event: StripeElementChangeEvent) => paymentFormComplete = event.complete" />
            </StripeElementsVue>
            <div id="buttons-row">
                <RouterLink to="/mes-informations"><button class="retour-button">Retour</button></RouterLink>
                <button type="submit" :class="{ activated: paymentFormComplete }">Payer les {{ verifiedAmount }}€</button>
            </div>
        </form>
        <Loader v-if="!stripeRendered && !userExists"></Loader>
        <div id="free-event" v-if="verifiedAmount === 0 && !userExists">
            <h3>Aucun paiement à effectuer !</h3>
            <div id="buttons-row">
                <RouterLink to="/mes-informations"><button class="retour-button">Retour</button></RouterLink>
                <button type="submit" class="activated" @click="handleNullPayment()">Continuer</button>
            </div>
        </div>
        <div id="already-exists" v-if="userExists">
            <h3>Une adhésion est déjà associée à cet email</h3>
            <RouterLink to="/mes-informations"><button class="retour-button">Retour</button></RouterLink>
        </div>
    </div>
</template>

<style scoped>

#payment-wrapper {
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

form {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: 'Lexend', sans-serif;
}

#buttons-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 40px;
    width: 100%;
}

button {
    font-size: 120%;
    padding: 10px;
    color: white;
    border: 1px white solid;
    border-radius: 5px;
    font-family: 'Lexend', sans-serif;
}

.retour-button {
    background-color: #3a96cc;
}

.retour-button:hover {
    background-color: #0a94e4;
    cursor: pointer;
}

button[type="submit"] {
    margin-top: 0;
    background-color: #474646;
    cursor: not-allowed;
    border: none;
}

button[type="submit"].activated {
    background-color: #45a049;
    cursor: pointer;
}

button[type="submit"].activated:hover {
    background-color: #45a049;
}

#already-exists {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

h3 {
    font-family: 'Lexend', sans-serif;
    text-align: center;
    margin-top: 20px;
    color: white;
}

</style>