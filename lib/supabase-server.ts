import { createClient } from '@supabase/supabase-js';

// 当设置了 HTTP_PROXY/HTTPS_PROXY 时，强制 Node.js 的 fetch 走代理（Clash 等）
const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (proxy) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { setGlobalDispatcher, ProxyAgent } = require('undici');
    setGlobalDispatcher(new ProxyAgent(proxy));
  } catch {
    // undici 可能不可用，忽略
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase not configured');
  }
  return createClient(supabaseUrl, supabaseKey);
}
