import { createClient } from "@supabase/supabase-js";
import { adminEmails, hasServiceConfig } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";

export function createAdminSupabase() {
  if (!hasServiceConfig()) {
    throw new Error("Supabase service configuration is missing.");
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  const email = user?.email?.toLowerCase();

  if (!user || !adminEmails().includes(email)) {
    const error = new Error("Admin access required.");
    error.status = 403;
    throw error;
  }

  return user;
}
