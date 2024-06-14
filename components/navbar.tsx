"use client";
import React, { FC, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
interface ComponentProps {}
import "dotenv/config";
import { parseJwt } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar: FC<ComponentProps> = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const { setTheme } = useTheme();
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [initials, setInitials] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  useEffect(() => {
    setTheme(isDarkMode ? "dark" : "light");
  }, [isDarkMode, setTheme]);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND;
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
            const payload = parseJwt(token);
            setUsername(payload.username);
            const firstName = payload.firstName;
            const lastName = payload.lastName;
            const role = payload.role;
            setUserRole(role);
            setFullName(`${firstName} ${lastName}`);
            setInitials(`${firstName[0]}${lastName[0]}`);
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
  if (pathname === "/auth/verify" || pathname === "/404") {
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
          href="/posts"
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
          <>
            {userRole === "Poster" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Poster</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Link href="/posts/create">Create New Post</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="#">My Posts</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {userRole === "Viewer" && (
              <Button variant="outline" disabled>
                Viewer
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src="#" />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="font-medium">{fullName}</div>
                      <div
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        @{username}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full ml-2"
                    >
                      <FilePenIcon className="w-4 h-4" />
                      <span className="sr-only">Edit profile</span>
                    </Button>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <HeartIcon className="w-4 h-4 mr-2" />
                  Liked Posts
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BookmarkIcon className="w-4 h-4 mr-2" />
                  Saved Posts
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Link
              href="/auth/signin"
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
              href="/auth/signup"
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
interface CalendarDaysIconProps extends React.SVGProps<SVGSVGElement> {}

const CalendarDaysIcon: React.FC<CalendarDaysIconProps> = (props) => {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
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
interface LogOutIconProps extends React.SVGProps<SVGSVGElement> {}

const LogOutIcon: React.FC<LogOutIconProps> = (props) => {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
};
interface HeartIconProps extends React.SVGProps<SVGSVGElement> {}

const HeartIcon: React.FC<HeartIconProps> = (props) => {
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
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
};
interface GiftIconProps extends React.SVGProps<SVGSVGElement> {}

const GiftIcon: React.FC<GiftIconProps> = (props) => {
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
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  );
};
interface FilePenIconProps extends React.SVGProps<SVGSVGElement> {}

const FilePenIcon: React.FC<FilePenIconProps> = (props) => {
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
      <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
    </svg>
  );
};
function BookmarkIcon(
  props: React.SVGProps<SVGSVGElement> & { filled?: boolean }
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={props.filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}
export default Navbar;
