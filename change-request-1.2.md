# Change Requests (v1.2) - Transaction Detail Page UI & Logic

## 1. Visual Hierarchy & Data Display
- **Status Highlight:** Make the current transaction status highly prominent at the top of the detail page. Use large visual badges with semantic colors (e.g., yellow/orange for `WAITING_FOR_PAYMENT`, green for `PAID` / `SUCCESSFULLY_DELIVERED`, red for `DISPUTED`).
- **Subject Highlight:** The `subject` (předmět obchodu) must be visually emphasized (e.g., large typography, H1/H2) so users immediately recognize the transaction context.
- **Participants:** Clearly display both the `buyer_email` and `seller_email` on the page so both parties have a record of who they are dealing with.

## 2. Role-Based Conditional UI (State: WAITING_FOR_PAYMENT)
The UI must render differently based on which PIN was used to access the page (Buyer vs. Seller):
- **Buyer View:** - Display the payment QR code (SPAYD format, dynamically calculated to include the original amount + 1% fee).
  - Add a prominent call-to-action note: "Zaplaťte prosím" (Please pay).
- **Seller View:** - Hide all payment instructions.
  - Display a strong, highly visible warning alert: "Neposílejte předmět, vyčkejte na email s potvrzením o zaplacení" (Do not send the item, wait for the payment confirmation email).

## 3. Layout Requirements
- **Contact Footer:** Ensure that the standard global footer, which contains the contact information (dummy phone number and support email), is rendered and clearly visible at the bottom of the transaction detail page.