import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          title: string;
          assignee: "hyejin" | "mingyoo";
          status: "todo" | "doing" | "done";
          position: number;
          created_at: string;
          updated_at: string;
        };
      };
      retros: {
        Row: {
          id: string;
          author: "hyejin" | "mingyoo";
          week_of: string;
          good: string;
          bad: string;
          next_action: string;
          created_at: string;
        };
      };
    };
  };
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey };
}

export function hasSupabaseServerEnv() {
  return Boolean(getSupabaseConfig());
}

export function createSupabaseServerClient(): SupabaseClient<Database> | null {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  return createClient<Database>(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
