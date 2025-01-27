# Stripe Payment Link Demo with Onboarding Flow

This document outlines the steps to extend a Stripe Connect onboarding demo in Next.js to include payment link creation with commission, along with a seamless user flow.

---

## **Features Covered**
1. **Onboarding for Connected Accounts**
2. **Payment Link Creation After Onboarding**
3. **Commission Deduction for Platform Account**
4. **Displaying Payment Links**

---

## **Prerequisites**
- **Stripe Account**: Ensure you have a Stripe account with Connect enabled.
- **Environment Variables**: Add your Stripe API keys to a `.env` file in the project root:
  ```
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_12345
  STRIPE_SECRET_KEY=sk_test_12345
  ```
- **Dependencies**:
  ```bash
  npm install @stripe/react-connect-js stripe dotenv
  ```

---

## **Project Structure**
The project contains the following key files:
- **Frontend**:
  - `index.tsx`: Main page with onboarding and payment link flow.
  - `hooks/useStripeConnect.js`: Hook to initialize Stripe Connect.
- **Backend (API Routes)**:
  - `pages/api/account.js`: API to create a connected account.
  - `pages/api/account_session.js`: API to create an account session for onboarding.
  - `pages/api/create_payment_link.js`: API to generate payment links with commission.
- **Utils**:
  - `lib/utils.js`: Exports the initialized Stripe client.

---

## **Implementation Details**

### **1. Connected Account Onboarding**
Connected accounts are created via an API endpoint and onboarded using Stripe's embedded component.

#### **Frontend Logic**
File: `index.tsx`

- Users click "Sign up" to create a connected account.
- After creation, the user is redirected to the onboarding flow using the `ConnectAccountOnboarding` component.

#### **API for Account Creation**
File: `pages/api/account.js`
```javascript
import { stripe } from "../../lib/utils";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const account = await stripe.accounts.create({});

      res.json({ account: account.id });
    } catch (error) {
      console.error("Error creating connected account:", error);
      res.status(500).json({ error: error.message });
    }
  }
}
```

---

### **2. Payment Link Creation After Onboarding**
Payment links are generated for connected accounts once the onboarding process is complete.

#### **Frontend Logic**
File: `index.tsx`

- A button is displayed after onboarding to create a payment link.
- On clicking the button, the frontend calls the payment link creation API.
- The payment link is displayed to the user once created.

#### **API for Payment Link Creation**
File: `pages/api/create_payment_link.js`
```javascript
import { stripe } from "../../lib/utils";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { accountId, amount, currency, description } = req.body;

    try {
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price_data: {
              currency: currency || "usd",
              product_data: {
                name: description || "Custom Payment",
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        application_fee_amount: Math.round(amount * 0.1), // 10% commission
      }, {
        stripeAccount: accountId,
      });

      res.json({ paymentLink: paymentLink.url });
    } catch (error) {
      console.error("Error creating payment link:", error);
      res.status(500).json({ error: error.message });
    }
  }
}
```

---

### **3. Commission Deduction**
The `application_fee_amount` parameter in the payment link API ensures that a portion of each transaction is directed to the platform account.

Example:
```javascript
application_fee_amount: Math.round(amount * 0.1) // Deducts 10% commission
```
Adjust the percentage or set a fixed amount as required.

---

### **4. Displaying Payment Links**
Payment links generated by the API are displayed to the user in the frontend.

#### **Frontend Example**
File: `index.tsx`
```javascript
const createPaymentLink = async () => {
  try {
    const response = await fetch("/api/create_payment_link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountId: connectedAccountId,
        amount: 2000, // Amount in cents ($20.00)
        currency: "usd",
        description: "Service Payment",
      }),
    });

    const { paymentLink } = await response.json();
    setPaymentLink(paymentLink);
  } catch (error) {
    console.error("Error creating payment link:", error);
    setError(true);
  }
};
```

---

## **User Flow**
1. **Sign Up**:
   - User clicks "Sign up" to create a connected account.
   - API creates the account and retrieves the `accountId`.

2. **Onboarding**:
   - User completes onboarding using `ConnectAccountOnboarding`.
   - Onboarding process exits, and the `accountId` is saved.

3. **Payment Link Creation**:
   - User clicks "Create Payment Link."
   - The API generates a payment link with commission deducted for the platform account.
   - The payment link is displayed for the user to share.

---

## **Next Steps**
- **Testing**:
  - Use Stripe's test environment to test the flow end-to-end.
- **Deployment**:
  - Deploy the application to a platform like Vercel or AWS.
- **Enhancements**:
  - Add support for dynamic payment amounts.
  - Create an admin dashboard to view all connected accounts and transactions.

---

For more information, refer to the [Stripe Connect Documentation](https://stripe.com/docs/connect).

