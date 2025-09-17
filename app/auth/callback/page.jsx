"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const finalize = async () => {
      try {
        const urlError = searchParams?.get("error_description") || searchParams?.get("error");
        if (urlError) {
          setError(urlError);
          return;
        }

        // Lazy-load Supabase only on the client to avoid build-time env access
        const { getSupabase } = await import("@/lib/supabaseClient");
        const supabase = getSupabase();
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (exchangeError) {
          setError(exchangeError.message || "Authentication failed.");
          return;
        }

        // Optional: small delay to ensure session propagation
        setTimeout(() => {
          if (!isMounted) return;
          router.replace("/");
        }, 250);
      } catch (e) {
        setError(e?.message || "Authentication failed. Please try again.");
      }
    };

    finalize();
    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-xl font-semibold text-gray-900">Signing you in…</h1>
        <p className="mt-2 text-sm text-gray-600">Completing Google authentication.</p>
        {error && (
          <div className="mt-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

