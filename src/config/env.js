// Environment configuration
export const config = {
  // Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
  },
  
  // OpenAI
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    baseURL: 'https://api.openai.com/v1',
  },
  
  // Anthropic
  anthropic: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
    baseURL: 'https://api.anthropic.com/v1',
  },
  
  // Stripe
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  },
  
  // Farcaster
  farcaster: {
    apiKey: import.meta.env.VITE_NEYNAR_API_KEY || '',
    baseURL: 'https://api.neynar.com/v2',
  },
  
  // Base RPC
  base: {
    rpcUrl: import.meta.env.VITE_BASE_RPC_URL || 'https://mainnet.base.org',
  },
  
  // Turnkey
  turnkey: {
    apiKey: import.meta.env.VITE_TURNKEY_API_KEY || '',
    baseURL: 'https://api.turnkey.com',
  },
  
  // Pinata
  pinata: {
    apiKey: import.meta.env.VITE_PINATA_API_KEY || '',
    secretKey: import.meta.env.VITE_PINATA_SECRET_KEY || '',
    baseURL: 'https://api.pinata.cloud',
  },
  
  // App settings
  app: {
    name: 'AdRemixr',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
  }
}

export default config
