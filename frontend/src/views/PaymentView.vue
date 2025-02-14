<script setup lang="ts">

import { loadStripe } from "@stripe/stripe-js"
import { StripeElement, StripeElements as StripeElementsWrapper } from "vue-stripe-js";
import type {
    StripeElements,
    StripeElementsOptionsMode,
    Stripe,
} from "@stripe/stripe-js";

import { usePersonStore } from "@/stores/person";

import { ref, onBeforeMount } from "vue";

const stripePk = import.meta.env.STRIPE_PK;
const stripeOptions = ref<StripeElementsOptionsMode>({
    mode: "payment",
    amount: import.meta.env.AMOUNT,
    currency: "eur",
    appearance: {
        theme: "stripe",
    }
});
const stripeLoaded = ref(false)
const clientSecret = ref("")
const elementsComponent = ref()
const paymentComponent = ref()


onBeforeMount(() => {
    
    loadStripe(stripePk).then(() => {
        fetch("/api/person", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(usePersonStore().$state),
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                clientSecret.value = data.clientSecret;
                (elementsComponent.value as StripeElements).getElement("payment")?.on
            });
    });
});

async function handlePaymentSubmit() {
    const stripeInstance = elementsComponent.value?.instance as Stripe
    const elements = elementsComponent.value?.elements as StripeElements

    if (stripeInstance) {
        await elements.submit()
        const { error } = await stripeInstance.confirmPayment({
            elements,
            clientSecret: clientSecret.value,
            confirmParams: {
                return_url: import.meta.env.BASE_URL + "/final",
            },

        })

        if (error) {
            // This point is only reached if there's an immediate error when
            // confirming the payment. Show the error to your customer (for example, payment details incomplete)
            console.log(error)
        }
    }
}

</script>

<template>
    <div id="payment-wrapper">
        <h2>Paiement</h2>
        <form v-if="stripeLoaded" @submit.prevent="handlePaymentSubmit">
            <StripeElementsWrapper
                :stripe-key="stripePk" 
                :instance-options="{}"
                :elements-options="stripeOptions" 
                ref="elementsComponent"
            >
                <StripeElement type="payment" :options="{}" ref="paymentComponent" />
            </StripeElementsWrapper>
            <button type="submit">Submit</button>
        </form>
        <div v-else>
            hello there
        </div>
    </div>
</template>

<style>

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

</style>