/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly AMOUNT: number
    readonly BASE_URL: string
    readonly STRIPE_PK: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}