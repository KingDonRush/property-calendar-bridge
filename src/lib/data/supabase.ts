import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getDatabaseConfig } from "../config.js";

let client: SupabaseClient | undefined;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const { supabaseUrl, supabaseKey } = getDatabaseConfig();
  client = createClient(supabaseUrl, supabaseKey);
  return client;
}

