// index.tsx

import React, { useState } from "react";
import { useStripeConnect } from "../hooks/useStripeConnect";
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";

export default function Home() {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [onboardingExited, setOnboardingExited] = useState(false);
  const [error, setError] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState();
  const [paymentLink, setPaymentLink] = useState("");
  const stripeConnectInstance = useStripeConnect(connectedAccountId);

  const createPaymentLink = async () => {
    try {
      const body = JSON.stringify({
        accountId: connectedAccountId,
        amount: 2000, // Amount in cents ($20.00)
        currency: "usd",
        description: "Service Payment"
      });
      console.log('payment link body: ', body)
      const response = await fetch("/api/create_payment_link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body
      });

      const { paymentLink } = await response.json();
      setPaymentLink(paymentLink);
    } catch (error) {
      console.error("Error creating payment link:", error);
      setError(true);
    }
  };

  return (
    <div className="container">
      <div className="banner">
        <h2>Rocket Rides</h2>
      </div>
      <div className="content">
        {!connectedAccountId && <h2>Get ready for take off</h2>}
        {connectedAccountId && !stripeConnectInstance && (
          <h2>Add information to start accepting money</h2>
        )}
        {!connectedAccountId && (
          <p>
            Rocket Rides is the world's leading air travel platform: join our
            team of pilots to help people travel faster.
          </p>
        )}
        {!accountCreatePending && !connectedAccountId && (
          <div>
            <button
              onClick={async () => {
                setAccountCreatePending(true);
                setError(false);
                fetch("/api/account", {
                  method: "POST",
                })
                  .then((response) => response.json())
                  .then((json) => {
                    setAccountCreatePending(false);
                    const { account, error } = json;

                    if (account) {
                      setConnectedAccountId(account);
                    }

                    if (error) {
                      setError(true);
                    }
                  });
              }}
            >
              Sign up
            </button>
          </div>
        )}
        {stripeConnectInstance && (
          <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            <ConnectAccountOnboarding
              onExit={() => setOnboardingExited(true)}
            />
          </ConnectComponentsProvider>
        )}
        {onboardingExited && connectedAccountId && (
          <div>
            <button onClick={createPaymentLink}>Create Payment Link</button>
          </div>
        )}
        {paymentLink && (
          <div>
            <p>
              Payment Link Created:{" "}
              <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                {paymentLink}
              </a>
            </p>
          </div>
        )}
        {error && <p className="error">Something went wrong!</p>}
        {(connectedAccountId || accountCreatePending || onboardingExited) && (
          <div className="dev-callout">
            {connectedAccountId && (
              <p>
                Your connected account ID is:{" "}
                <code className="bold">{connectedAccountId}</code>
              </p>
            )}
            {accountCreatePending && <p>Creating a connected account...</p>}
            {onboardingExited && (
              <p>The Account Onboarding component has exited</p>
            )}
          </div>
        )}
        <div className="info-callout">
          <p>
            This is a sample app for Connect onboarding using the Account
            Onboarding embedded component.{" "}
            <a
              href="https://docs.stripe.com/connect/onboarding/quickstart?connect-onboarding-surface=embedded"
              target="_blank"
              rel="noopener noreferrer"
            >
              View docs
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
