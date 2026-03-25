# Project: Escrow Service for C2C Marketplaces

## 1. Context and Goal

We are developing a web application that acts as an escrow intermediary for secure C2C purchases on marketplaces and classified ads. The application holds the buyer's money safely until the goods are successfully delivered by the seller.

The system is designed iteratively:

- **v1 (Current Phase):** Manual payment and payout confirmation by the administrator.
- **v2 (Planned Phase - DO NOT IMPLEMENT YET):** Automated payment matching via cron jobs and banking APIs, automated payouts, payment gateways.

## 2. Tech Stack

- **Environment:** Hosted on Vercel.
- **Stack:** Strictly use the same technology stack, frameworks, and database ORM as used in the "vsebezlepku" project.
- **Language:** TypeScript (strictly typed).

## 3. Domain Model: Transaction

The main entity in the database must contain at least these attributes:

- `id` (UUID / Primary Key)
- `seller_email` (String, required)
- `seller_bank_account` (String, required)
- `buyer_email` (String, required)
- `amount` (Decimal/Float, required)
- `subject` (String, optional)
- `description` (Text, optional)
- `status` (Enum - see Transaction Lifecycle)
- `tracking_id` (String, nullable)
- `pin_code_buyer` (String, hashed/encrypted, used for authentication)
- `pin_code_seller` (String, hashed/encrypted, used for authentication)
- `created_at`, `updated_at`

## 4. Transaction Lifecycle (State Machine)

Every transaction strictly follows these states:

1. `WAITING_FOR_PAYMENT` (Default state upon creation).
2. `PAID` (Money arrived at the escrow account).
3. `SHIPPED` (Seller sent the package and provided a tracking ID).
4. `SUCCESSFULLY_DELIVERED` (Buyer confirmed everything is fine).
5. `DISPUTED` (Buyer filed a complaint - blocks the payout).
6. `COMPLETED` (Money was sent to the seller, transaction is closed).

## 5. User Flow and Notifications (Emails)

### Phase 1: Creation (Status: WAITING_FOR_PAYMENT)

- **Action:** Anyone creates a transaction via a public form. Unique PIN codes are generated for both parties.
- **Email to Buyer:** Confirmation + QR code for payment (SPAYD format for Czech banks) + unique PIN to access the transaction details.
- **Email to Seller:** Info about creation with the instruction "DO NOT SHIP YET, waiting for payment" + unique PIN to access the transaction details.

### Phase 2: Paid (Status: PAID)

- **Action (v1):** Admin manually changes the status to `PAID` in the admin dashboard.
- **Email to Seller:** Payment receipt confirmation with a prompt to ship the goods. Includes a link to the transaction detail.
- **Seller UI:** After entering their email and PIN, they see the detail page with an input field for the `tracking_id`. Upon saving the `tracking_id`, the status changes to `SHIPPED`.

### Phase 3: Shipped (Status: SHIPPED)

- **Email to Buyer:** Notification with the `tracking_id` and a prompt to track the package. Includes a link to the transaction detail.
- **Buyer UI:** After entering their email and PIN, they see two buttons: "Confirm Delivery" (changes status to `SUCCESSFULLY_DELIVERED`) or "File a Complaint" (changes status to `DISPUTED`).

### Phase 4: Delivered and Paid Out

- **Action (v1):** Once the status is `SUCCESSFULLY_DELIVERED`, the admin manually sends the money to the seller's bank account and changes the status to `COMPLETED`.
- **Email to BOTH:** Upon switching to `COMPLETED`, a message is sent to both users that the transaction was successfully closed, along with a request for user rating/feedback.

## 6. Admin Section

The admin panel is protected (admin authentication required).
**Features:**

- List of all transactions (table with status filtering).
- Transaction detail (displays complete data).
- Ability to manually change states (especially switching to `PAID` and `COMPLETED`).
- Ability to add internal comments to the transaction (for issue resolution).

## 7. Security Rules

- End users do not have standard accounts with passwords. They authenticate against a specific transaction using a combination of their **Email and the unique PIN** sent to them.
- The application must ensure role-based access control based on the provided email/PIN: the buyer cannot modify the `tracking_id`, and the seller cannot confirm delivery.

## 8. Technical Guidelines for AI (Copilot)

- Separate business logic (transaction services, emails) from routing and controllers.
- In v1, do not implement real payment gateways or bank verification; use mocks/placeholders or the manual admin interface.
- Handle emails via a dummy logger (e.g., `console.log` or a simple mailer configured for Mailtrap).
- Generate the payment QR code (SPAYD format) using an appropriate library.
