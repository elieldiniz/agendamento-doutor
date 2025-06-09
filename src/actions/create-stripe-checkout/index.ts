"use server";

import Stripe from "stripe";

import { protectedActionClient } from "@/lib/next-safe-action";

export const createStripeCheckout = protectedActionClient.action(
  async ({ ctx }) => {
    console.log("🔑 Iniciando criação do checkout Stripe");
    console.log("👤 User ID:", ctx.user.id);
    
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not found");
    }
    
    if (!process.env.STRIPE_ESSENTIAL_PLAN_PRICE_ID) {
      throw new Error("Stripe price ID not found");
    }
    
    console.log("💰 Price ID:", process.env.STRIPE_ESSENTIAL_PLAN_PRICE_ID);
    console.log("🌐 App URL:", process.env.NEXT_PUBLIC_APP_URL);
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-05-28.basil",
    });
    
    const { id: sessionId } = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      subscription_data: {
        metadata: {
          userId: ctx.user.id,
        },
      },
      line_items: [
        {
          price: process.env.STRIPE_ESSENTIAL_PLAN_PRICE_ID,
          quantity: 1,
        },
      ],
    });
    
    console.log("✅ Session criada:", sessionId);
    
    return {
      sessionId,
    };
  },
);