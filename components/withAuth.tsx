"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const Auth = (props: P) => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const token = sessionStorage.getItem("token");
          const backendUrl = process.env.BACKEND || "http://localhost:5000";
          if (token !== null && token !== undefined) {
            const response = await fetch(backendUrl + "/api/checkauth", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            if (response.ok) {
              setLoading(false);
            } else {
              sessionStorage.removeItem("token");
              router.push("/auth/signin");
            }
          } else {
            router.push("/");
          }
        } catch (err) {
          console.error(err);
          router.push("/auth/signin");
        }
      };
      checkAuth();
    }, [router]);
    return (
      <>
        {loading && (
          <div className="flex fixed left-0 right-0 top-0 h-screen items-center justify-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          </div>
        )}
        {!loading && <Component {...props} />}
      </>
    );
  };
  return Auth;
};

export default withAuth;
