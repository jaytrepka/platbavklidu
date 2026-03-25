# Change Requests (v1.3) - Security, State Machine & Business Logic Updates

## 1. Data Model Updates
To fix critical security flaws and support the new flow, update the Transaction entity:
- Add `created_by` (Enum: `BUYER` | `SELLER`): To track who initiated the transaction.
- Replace `pin_code_buyer` and `pin_code_seller` with `access_token_buyer` and `access_token_seller` (String, UUID/long cryptographically secure random string). 
  - *Reasoning:* Simple PINs are vulnerable to brute-force attacks. We are switching to secure Magic Links for authentication.

## 2. State Machine Overhaul
Update the transaction lifecycle to include approval, expiration, and refund states. The strict order is now:
1. `WAITING_FOR_APPROVAL` (New): Transaction created by one party, waiting for the other party to confirm details and agree.
2. `WAITING_FOR_PAYMENT`: Approved by both, waiting for the buyer's payment.
3. `PAID`: Money secured in the escrow account.
4. `SHIPPED`: Seller provided the tracking ID.
5. `SUCCESSFULLY_DELIVERED`: Buyer confirmed the item is okay.
6. `DISPUTED`: Buyer reported an issue.
7. `COMPLETED`: Money paid out to the seller (Happy path end).
8. `REFUNDED` (New): Money returned to the buyer (Admin action).
9. `EXPIRED` (New): Canceled due to inactivity (e.g., not paid in time).

## 3. The "Fake Seller" Security Fix (Approval Flow)
To prevent bad actors from entering their own bank accounts for someone else's email:
- **If Buyer creates the transaction:** The Seller receives an email with a Magic Link. They must click it, review the transaction, and **manually enter their bank account number** to approve it. Only then does the state change to `WAITING_FOR_PAYMENT` and the Buyer gets the payment QR code.
- **If Seller creates the transaction:** The Buyer receives an email with a Magic Link. They must click it to approve the purchase. After approval, the state changes to `WAITING_FOR_PAYMENT` and the Buyer sees the payment QR code.

## 4. Fee Structure Update
- Update the fee calculation logic. Instead of just 1%, the platform fee is now **1% of the transaction amount or 10 CZK** depends what is bigger.
- Update the UI, total amount calculation, and the SPAYD QR code generator to reflect this new formula: `Total = Original Amount + Max(Original Amount * 0.01), 10 CZK)`.
- Update also terms and conditions"

## 5. Security & Authentication (Magic Links)
- Remove the manual PIN entry UI. 
- Users will authenticate exclusively by clicking the unique URL (Magic Link) sent to their email. Format example: `/transaction/[id]?token=[access_token_buyer]`.
- The application must validate the token against the database to determine if the user is viewing as the Buyer or the Seller.

## 6. Admin Panel Updates (Dispute Resolution)
When a transaction is in the `DISPUTED` state, the Admin must have two action buttons to resolve the conflict:
- **Resolve for Buyer:** Changes status to `REFUNDED` (Admin manually sends money back to the buyer).
- **Resolve for Seller:** Changes status to `COMPLETED` (Admin manually sends money to the seller's bank account).