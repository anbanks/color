declare global {
  interface CloudflareEnv {
    DB: D1Database;
    CACHE: KVNamespace;
    STORAGE: R2Bucket;
    AI: Ai;
    RESEND_API_KEY?: string;
  }
}

export {};
