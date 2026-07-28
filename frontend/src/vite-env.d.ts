/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USER_CONTRACT_ID: string;
  readonly VITE_POLL_CONTRACT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
