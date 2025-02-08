import Stripe from "stripe";
import express from "express";

const backend = express();
backend.use(express.static('public'));




const stripe = new Stripe("sk_test_4eC39HqLyjWDarjtT1zdp7dc");


backend.listen(5173, () => {console.log("Backend is running on port 5173")});