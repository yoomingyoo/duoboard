import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          slug: string;
          name: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          is_default?: boolean;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          assignee: "hyejin" | "mingyoo";
          status: "todo" | "doing" | "done";
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          assignee: "hyejin" | "mingyoo";
          status: "todo" | "doing" | "done";
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          assignee?: "hyejin" | "mingyoo";
          status?: "todo" | "doing" | "done";
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      retros: {
        Row: {
          id: string;
          project_id: string;
          author: "hyejin" | "mingyoo";
          week_of: string;
          good: string;
          bad: string;
          next_action: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          author: "hyejin" | "mingyoo";
          week_of: string;
          good: string;
          bad: string;
          next_action: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          author?: "hyejin" | "mingyoo";
          week_of?: string;
          good?: string;
          bad?: string;
          next_action?: string;
          created_at?: string;
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
