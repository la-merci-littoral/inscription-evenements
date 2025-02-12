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
                stripeLoaded.value = true;
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
    </div>
</template>

<style>

</style>