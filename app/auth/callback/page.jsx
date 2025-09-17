"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingView />}> 
      <CallbackInner />
    </Suspense>
  );
}

function LoadingView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-xl font-semibold text-gray-900">Signing you in…</h1>
        <p className="mt-2 text-sm text-gray-600">Completing Google authentication.</p>
      </div>
    </div>
  );
}

function CallbackInner() {
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

        const { getSupabase } = await import("@/lib/supabaseClient");
        const supabase = getSupabase();
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (exchangeError) {
          setError(exchangeError.message || "Authentication failed.");
          return;
        }

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
          <div className="mt-4 text-sm text-red-600">{error}</div>
        )}
      </div>
    </div>
  );
}

