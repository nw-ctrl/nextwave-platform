"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Props = {
  label?: string;
  className?: string;
};

type StripeWindow = Window & {
  Stripe?: (publishableKey: string) => {
    redirectToCheckout: (options: { sessionId: string }) => Promise<{ error?: { message?: string } }>;
  };
};

let stripeScriptPromise: Promise<void> | null = null;

function loadStripeScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Stripe.js can only load in the browser"));
  }

  const stripeWindow = window as StripeWindow;
  if (stripeWindow.Stripe) {
    return Promise.resolve();
  }

  if (!stripeScriptPromise) {
    stripeScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Stripe.js"));
      document.head.appendChild(script);
    });
  }

  return stripeScriptPromise;
}

export function CheckoutCta({ label = "Start Test Subscription", className = "btn btn-primary" }: Props) {
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const checkoutState = useMemo(() => searchParams.get("checkout"), [searchParams]);

  useEffect(() => {
    if (checkoutState === "success") {
      setMessage("Stripe checkout completed. Confirm the subscription status in the admin dashboard.");
      return;
    }

    if (checkoutState === "cancel") {
      setMessage("Stripe checkout was canceled before payment confirmation.");
      return;
    }

    setMessage(null);
  }, [checkoutState]);

  async function handleClick() {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });

      const result = (await response.json()) as {
        error?: string;
        publishableKey?: string;
        sessionId?: string;
        url?: string | null;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to create checkout session");
      }

      if (!result.publishableKey || !result.sessionId) {
        throw new Error("Checkout session response is incomplete");
      }

      await loadStripeScript();
      const stripe = (window as StripeWindow).Stripe?.(result.publishableKey);
      if (!stripe) {
        throw new Error("Stripe.js failed to initialize");
      }

      const redirectResult = await stripe.redirectToCheckout({ sessionId: result.sessionId });
      if (redirectResult.error?.message) {
        throw new Error(redirectResult.error.message);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Stripe checkout failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="checkout-cta">
      <button className={className} type="button" onClick={handleClick} disabled={pending}>
        {pending ? "Preparing Checkout..." : label}
      </button>
      {message ? <p className="checkout-message">{message}</p> : null}
    </div>
  );
}
