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
    confirmDisputeQuestion: "Opravdu chcete podat reklamaci? Vyplatení bude pozastaveno.",
    yes: "Ano",
    no: "Ne",
    cancel: "Zrušit",
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
