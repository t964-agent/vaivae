interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_SANITY_STUDIO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
