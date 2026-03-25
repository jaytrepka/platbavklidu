export type Locale = "cs" | "en";

const translations = {
  cs: {
    // Common
    appName: "Platba v klidu",
    appDescription: "Bezpečná escrow služba pro C2C obchody",
    language: "Jazyk",
    czech: "Čeština",
    english: "English",
    
    // Navigation
    home: "Domů",
    admin: "Admin",
    
    // Form labels
    sellerEmail: "E-mail prodávajícího",
    sellerBankAccount: "Bankovní účet prodávajícího (IBAN)",
    buyerEmail: "E-mail kupujícího",
    amount: "Částka (CZK)",
    subject: "Předmět obchodu",
    description: "Popis",
    createTransaction: "Vytvořit transakci",
    
    // Transaction statuses
    status_WAITING_FOR_PAYMENT: "Čeká na platbu",
    status_PAID: "Zaplaceno",
    status_SHIPPED: "Odesláno",
    status_SUCCESSFULLY_DELIVERED: "Úspěšně doručeno",
    status_DISPUTED: "Reklamace",
    status_COMPLETED: "Dokončeno",
    
    // Transaction detail
    transactionDetail: "Detail transakce",
    trackingId: "Sledovací číslo",
    enterTrackingId: "Zadejte sledovací číslo",
    confirmShipment: "Potvrdit odeslání",
    confirmDelivery: "Potvrdit doručení",
    fileComplaint: "Podat reklamaci",
    transactionCreated: "Transakce byla úspěšně vytvořena!",
    pinSentByEmail: "PIN kódy byly odeslány na e-mail kupujícího i prodávajícího.",
    
    // Auth
    email: "E-mail",
    pin: "PIN kód",
    login: "Přihlásit se",
    loginToTransaction: "Přístup k transakci",
    invalidCredentials: "Neplatné přihlašovací údaje",
    password: "Heslo",
    adminLogin: "Přihlášení do administrace",
    logout: "Odhlásit se",
    
    // Admin
    allTransactions: "Všechny transakce",
    filterByStatus: "Filtrovat podle stavu",
    allStatuses: "Všechny stavy",
    changeStatus: "Změnit stav",
    addComment: "Přidat komentář",
    comments: "Komentáře",
    noComments: "Žádné komentáře",
    internalComment: "Interní komentář",
    save: "Uložit",
    
    // Messages
    errorOccurred: "Došlo k chybě",
    loading: "Načítání...",
    noTransactions: "Žádné transakce",
    createdAt: "Vytvořeno",
    updatedAt: "Aktualizováno",
    buyer: "Kupující",
    seller: "Prodávající",
    bankAccount: "Bankovní účet",
    paymentQr: "QR kód pro platbu",
    
    // Confirmation messages
    confirmDeliveryQuestion: "Opravdu chcete potvrdit doručení? Tato akce je nevratná.",
    confirmDisputeQuestion: "Opravdu chcete podat reklamaci? Vyplatění bude pozastaveno.",
    yes: "Ano",
    no: "Ne",
    cancel: "Zrušit",

    // v1.1 - Post-creation
    backToHomepage: "Zpět na úvodní stránku",
    successHeading: "Transakce byla úspěšně vytvořena",
    successDescription: "Informace o dalším postupu byly odeslány na email kupujícího i prodávajícího.",

    // v1.1 - Fee
    totalAmount: "Celková částka",
    serviceFee: "Servisní poplatek (1 %)",
    feeTooltip: "Za zprostředkování bezpečného obchodu účtujeme servisní poplatek 1 % z částky transakce, minimálně 10 Kč.",
    amountWithoutFee: "Částka obchodu",

    // v1.1 - Stats
    statsHeading: "Důvěřují nám stovky uživatelů",
    statsTransactions: "Provedených transakcí",
    statsVolume: "Celkový objem obchodů",
    statsDescription: "Bezpečně a bez starostí",

    // v1.1 - Contact & Terms
    contact: "Kontakt",
    contactPhone: "+420 123 456 789",
    contactEmail: "podpora@platbavklidu.cz",
    terms: "Obchodní podmínky",
    termsTitle: "Obchodní podmínky služby Platba v klidu",
    howItWorks: "Jak to funguje",
    howItWorksStep1: "Kupující nebo prodávající vytvoří transakci přes náš formulář.",
    howItWorksStep2: "Kupující obdrží QR kód pro platbu na escrow účet. Částka zahrnuje 1% servisní poplatek.",
    howItWorksStep3: "Po přijetí platby je prodávající vyzván k odeslání zboží.",
    howItWorksStep4: "Kupující potvrdí doručení nebo podá reklamaci.",
    howItWorksStep5: "Po potvrzení doručení jsou peníze odeslány na účet prodávajícího.",
    feeExplanation: "Platba v klidu účtuje servisní poplatek ve výši 1 % z částky transakce (minimálně 10 Kč) za zprostředkování bezpečného obchodu mezi kupujícím a prodávajícím.",
    disputeExplanation: "V případě reklamace je vyplacení pozastaveno a náš tým situaci individuálně řeší.",

    // v1.2 - Transaction detail
    pleasePay: "Zaplaťte prosím",
    pleasePayDescription: "Naskenujte QR kód nebo proveďte platbu manuálně na escrow účet.",
    doNotShip: "Neposílejte předmět!",
    doNotShipDescription: "Vyčkejte na email s potvrzením o zaplacení. Teprve poté zboží odešlete.",
    participants: "Účastníci",
    otherParty: "Protistrana",
    you: "Vy",

    // v1.3 - Approval flow & states
    status_WAITING_FOR_APPROVAL: "Čeká na schválení",
    status_REFUNDED: "Vráceno",
    status_EXPIRED: "Vypršelo",
    createdByLabel: "Vytvořil",
    createdByBuyer: "Kupující",
    createdBySeller: "Prodávající",
    iAmBuyer: "Jsem kupující",
    iAmSeller: "Jsem prodávající",
    waitingForApproval: "Čeká na schválení protistranou",
    approveTransaction: "Schválit transakci",
    approveAndEnterBank: "Schválit a zadat bankovní účet",
    enterBankAccount: "Zadejte číslo bankovního účtu (IBAN)",
    transactionApproved: "Transakce byla schválena!",
    waitingForOtherParty: "Čekáme na schválení od protistrany.",
    resolveForBuyer: "Vrátit peníze kupujícímu",
    resolveForSeller: "Vyplatit prodávajícímu",
    minFeeNotice: "Minimální poplatek je 10 Kč",
  },
  en: {
    appName: "Platba v klidu",
    appDescription: "Secure escrow service for C2C trades",
    language: "Language",
    czech: "Čeština",
    english: "English",
    
    home: "Home",
    admin: "Admin",
    
    sellerEmail: "Seller email",
    sellerBankAccount: "Seller bank account (IBAN)",
    buyerEmail: "Buyer email",
    amount: "Amount (CZK)",
    subject: "Subject",
    description: "Description",
    createTransaction: "Create transaction",
    
    status_WAITING_FOR_PAYMENT: "Waiting for payment",
    status_PAID: "Paid",
    status_SHIPPED: "Shipped",
    status_SUCCESSFULLY_DELIVERED: "Successfully delivered",
    status_DISPUTED: "Disputed",
    status_COMPLETED: "Completed",
    
    transactionDetail: "Transaction detail",
    trackingId: "Tracking ID",
    enterTrackingId: "Enter tracking ID",
    confirmShipment: "Confirm shipment",
    confirmDelivery: "Confirm delivery",
    fileComplaint: "File a complaint",
    transactionCreated: "Transaction created successfully!",
    pinSentByEmail: "PIN codes have been sent to both buyer and seller emails.",
    
    email: "Email",
    pin: "PIN code",
    login: "Log in",
    loginToTransaction: "Access transaction",
    invalidCredentials: "Invalid credentials",
    password: "Password",
    adminLogin: "Admin login",
    logout: "Log out",
    
    allTransactions: "All transactions",
    filterByStatus: "Filter by status",
    allStatuses: "All statuses",
    changeStatus: "Change status",
    addComment: "Add comment",
    comments: "Comments",
    noComments: "No comments",
    internalComment: "Internal comment",
    save: "Save",
    
    errorOccurred: "An error occurred",
    loading: "Loading...",
    noTransactions: "No transactions",
    createdAt: "Created at",
    updatedAt: "Updated at",
    buyer: "Buyer",
    seller: "Seller",
    bankAccount: "Bank account",
    paymentQr: "Payment QR code",
    
    confirmDeliveryQuestion: "Are you sure you want to confirm delivery? This action cannot be undone.",
    confirmDisputeQuestion: "Are you sure you want to file a complaint? Payout will be suspended.",
    yes: "Yes",
    no: "No",
    cancel: "Cancel",

    backToHomepage: "Back to homepage",
    successHeading: "Transaction created successfully",
    successDescription: "Instructions for the next steps have been sent to both the buyer and seller emails.",

    totalAmount: "Total amount",
    serviceFee: "Service fee (1%)",
    feeTooltip: "We charge a service fee of 1% of the transaction amount (minimum 10 CZK) for providing a secure escrow intermediary service.",
    amountWithoutFee: "Trade amount",

    statsHeading: "Trusted by hundreds of users",
    statsTransactions: "Completed transactions",
    statsVolume: "Total trade volume",
    statsDescription: "Safe and worry-free",

    contact: "Contact",
    contactPhone: "+420 123 456 789",
    contactEmail: "podpora@platbavklidu.cz",
    terms: "Terms & Conditions",
    termsTitle: "Terms & Conditions of Platba v klidu",
    howItWorks: "How it works",
    howItWorksStep1: "The buyer or seller creates a transaction via our form.",
    howItWorksStep2: "The buyer receives a QR code for payment to the escrow account. The amount includes a 1% service fee.",
    howItWorksStep3: "After the payment is received, the seller is prompted to ship the goods.",
    howItWorksStep4: "The buyer confirms delivery or files a complaint.",
    howItWorksStep5: "After delivery confirmation, the funds are sent to the seller's bank account.",
    feeExplanation: "Platba v klidu charges a service fee of 1% of the transaction amount (minimum 10 CZK) for providing a secure escrow intermediary service between buyer and seller.",
    disputeExplanation: "In case of a complaint, the payout is suspended and our team resolves the situation individually.",

    pleasePay: "Please pay",
    pleasePayDescription: "Scan the QR code or make a manual payment to the escrow account.",
    doNotShip: "Do not ship the item!",
    doNotShipDescription: "Wait for the payment confirmation email before sending the goods.",
    participants: "Participants",
    otherParty: "Other party",
    you: "You",

    status_WAITING_FOR_APPROVAL: "Waiting for approval",
    status_REFUNDED: "Refunded",
    status_EXPIRED: "Expired",
    createdByLabel: "Created by",
    createdByBuyer: "Buyer",
    createdBySeller: "Seller",
    iAmBuyer: "I am the buyer",
    iAmSeller: "I am the seller",
    waitingForApproval: "Waiting for approval from the other party",
    approveTransaction: "Approve transaction",
    approveAndEnterBank: "Approve and enter bank account",
    enterBankAccount: "Enter your bank account number (IBAN)",
    transactionApproved: "Transaction approved!",
    waitingForOtherParty: "Waiting for approval from the other party.",
    resolveForBuyer: "Refund buyer",
    resolveForSeller: "Pay out to seller",
    minFeeNotice: "Minimum fee is 10 CZK",
  },
} as const;

export type TranslationKey = keyof typeof translations.cs;

export function getTranslations(locale: Locale) {
  return translations[locale];
}

export function getStatusLabel(status: string, locale: Locale): string {
  const key = `status_${status}` as TranslationKey;
  return translations[locale][key] || status;
}
