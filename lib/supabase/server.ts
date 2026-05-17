import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Only provide get method for Server Components
        // Remove set and remove methods as they can't be used in Server Components
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // set and remove are not needed in Server Components
        // They should only be used in Server Actions or Route Handlers
      },
    }
  );
};

// Create a separate client for Server Actions and Route Handlers
export const createServerSupabaseClientWithCookies = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // This can only be called in Server Actions/Route Handlers
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          // This can only be called in Server Actions/Route Handlers
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};