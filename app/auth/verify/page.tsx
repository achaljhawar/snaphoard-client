// app/verify/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPageContent />
    </Suspense>
  );
}

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const verification_code = searchParams.get("verification_code") || "";

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND || "http://localhost:5000";

  useEffect(() => {
    const verifyUser = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(backendUrl + "/api/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, verification_code }),
        });

        if (response.ok) {
          setIsVerified(true);
        } else {
          throw new Error("Failed to verify user");
        }
      } catch (error) {
        setErrorMessage((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    if (email && verification_code) {
      verifyUser();
    }
  }, [email, verification_code, backendUrl]);

  return (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-[#09090B]">
      {isLoading ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center animate-spin">
            <LoaderPinwheelIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Verifying your account...
          </p>
        </div>
      ) : isVerified ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center">
            <CheckIcon className="h-12 w-12 text-white" />
          </div>
          <p className="text-green-500 font-bold text-2xl">
            Verification Successful!
          </p>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-green-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-700 disabled:pointer-events-none disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-700 dark:focus-visible:ring-green-800"
            prefetch={false}
          >
            Go to Home
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-red-500 font-bold text-2xl">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function LoaderPinwheelIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12c0-2.8 2.2-5 5-5s5 2.2 5 5 5-2.2 5-5" />
      <path d="M7 20.7a1 1 0 1 1 5-8.7 1 1 0 1 0 5-8.6" />
      <path d="M7 3.3a1 1 0 1 1 5 8.6 1 1 0 1 0 5 8.6" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}