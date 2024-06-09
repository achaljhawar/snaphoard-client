"use client";
import React, { FC, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
interface ComponentProps {}
import "dotenv/config";

const Navbar: FC<ComponentProps> = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const { setTheme } = useTheme();
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    setTheme(isDarkMode ? "dark" : "light");
  }, [isDarkMode, setTheme]);
  const backendUrl = process.env.BACKEND || "http://localhost:5000";
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (token !== null && token !== undefined) {
          const response = await fetch(backendUrl + "/api/checkauth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            setLoggedIn(true);
          } else {
            sessionStorage.removeItem("token");
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkAuth();
  }, [loggedIn]);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setLoggedIn(false);
  };

  const pathname = usePathname();
  if (pathname === "/auth/verify") {
    return null;
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 md:px-6 lg:px-8">
      <Link href="/" className="flex items-center" prefetch={false}>
        <CameraIcon
          className={`h-6 w-6 ${isDarkMode ? "text-gray-50" : "text-gray-900"}`}
        />
        <span
          className={`ml-2 text-xl font-medium ${
            isDarkMode ? "text-gray-50" : "text-gray-900"
          }`}
        >
          Snaphoard
        </span>
      </Link>
      <nav className="flex items-center space-x-4 md:space-x-6">
        <Link
          href="#"
          className={cn(
            `text-base font-medium transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-gray-50"
                : "text-gray-700 hover:text-gray-900"
            }`,
            buttonVariants({ variant: "link" })
          )}
          prefetch={false}
        >
          Home
        </Link>
        <Link
          href="#"
          className={cn(
            `text-base font-medium transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-gray-50"
                : "text-gray-700 hover:text-gray-900"
            }`,
            buttonVariants({ variant: "link" })
          )}
          prefetch={false}
        >
          Explore
        </Link>
        {loggedIn ? (
          <Button
            variant="default"
            className={cn(
              `transition-colors ${
                isDarkMode
                  ? "bg-gray-700 text-gray-50 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-900 hover:bg-gray-300"
              }`
            )}
            onClick={handleLogout}
          >
            Logout
          </Button>
        ) : (
          <>
            <Link
              href="#"
              className={cn(
                `text-base font-medium transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-50"
                    : "text-gray-700 hover:text-gray-900"
                }`,
                buttonVariants({ variant: "link" })
              )}
              prefetch={false}
            >
              Login
            </Link>
            <Link
              href="#"
              className={cn(
                `text-base font-medium transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-50"
                    : "text-gray-700 hover:text-gray-900"
                }`,
                buttonVariants({ variant: "link" })
              )}
              prefetch={false}
            >
              Signup
            </Link>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={handleThemeToggle}
        >
          {isDarkMode ? (
            <SunIcon className="h-6 w-6 text-gray-50" />
          ) : (
            <MoonIcon className="h-6 w-6 text-gray-900" />
          )}
          <span className="sr-only">Toggle dark mode</span>
        </Button>
      </nav>
    </header>
  );
};
interface CameraIconProps {
  className: string;
}

const CameraIcon: FC<CameraIconProps> = (props) => {
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
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
};

interface MoonIconProps {
  className: string;
}

const MoonIcon: FC<MoonIconProps> = (props) => {
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
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
};

interface SunIconProps {
  className: string;
}

const SunIcon: FC<SunIconProps> = (props) => {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
};
export default Navbar;
