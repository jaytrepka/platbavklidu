# Change Requests (v1.1) - Escrow Service

## 1. UI/UX Improvements & Flow Changes
- **Post-Creation Screen:** After a transaction is created, do not just clear the form or leave the user on the same page. Display a dedicated success UI containing:
  - Heading: "Transakce byla úspěšně vytvořena"
  - Text: "Informace o dalším postupu byly odeslány na email kupujícího i prodávajícího."
  - Action: A button labeled "Zpět na úvodní stránku" (Back to homepage).
- **Design Upgrade:** Enhance the overall UI to be more modern, trustworthy, and "catchy". Utilize better spacing, shadows, modern typography, and color highlights (follow the design system established in the *vsebezlepku* project).
- **Homepage Statistics:** Below the main transaction form on the homepage, add a statistics section. Example format: "Provedeno [XY] transakcí v částce vyšší než [XY] Kč". (This can be hardcoded for the initial UI draft, but prepare the layout for dynamic DB data).

## 2. Business Logic & Fees (1% Service Fee)
- **Transaction Form Calculation:** When the user enters the transaction amount, dynamically calculate and display the "Total Amount" (`entered amount + 1%`).
- **Tooltip Explanation:** Add an info icon (`i`) next to the calculated total amount. When hovered, display a tooltip stating that a 1% service fee is applied for using the platform.
- **QR Code Generation:** The SPAYD format QR code generated for the buyer must strictly request the **total amount** (original amount + 1%).

## 3. New Static Sections/Pages
- **Contact Section:** Add a "Kontakt" section containing a dummy phone number and a dummy support email.
- **Terms & Conditions (Obchodní podmínky):** Add a section or dedicated page explaining exactly how the escrow process works. It must explicitly state that the platform charges a 1% fee for providing the secure intermediary service.

## 4. Development & Testing Features
- **Email Console Logger (Crucial for testing):** In the testing/development environment, all actions that trigger an email must log the complete email content (both for the buyer and the seller) directly into the terminal/console. This ensures the developer can easily copy the generated PINs and unique access links to test the transaction detail pages without needing a real SMTP setup.