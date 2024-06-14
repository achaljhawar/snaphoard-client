"use client";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { parseJwt } from "@/lib/utils";
import withAuth from "@/components/withAuth";
const backendUrl = process.env.NEXT_PUBLIC_BACKEND || "http://localhost:5000";
const socket = io(backendUrl, {
  reconnection: true,
});
interface LikeEventData {
  post_id: number;
  user_id: number;
}
function Page({ params }: { params: { slug: number } }) {
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [likecount, setlikecount] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND;
  const [postInfo, setPostInfo] = useState<{
    username: string;
    image_url: string;
    caption: string;
    initials: string;
    isliked: boolean;
    likecount: number;
  } | null>(null);
  const slug = params.slug;

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const checkAuth = async () => {
      try {
        if (token !== null && token !== undefined) {
          const response = await fetch(backendUrl + "/api/checkauth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };
    checkAuth();
  }, [backendUrl]);

  useEffect(() => {
    const fetchPostInfo = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (isLoggedIn && token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const response = await fetch(backendUrl + "/api/getpostinfo", {
          method: "POST",
          headers,
          body: JSON.stringify({ slug }),
        });
        if (response.ok) {
          const data = await response.json();
          setPostInfo(data);
          setlikecount(data.likecount);
          setIsLiked(data.isliked);
          setIsSaved(data.issaved); // Add this line
        } else {
          console.error("Error fetching post info:", response.statusText);
        }
      } catch (err) {
        console.error("Error fetching post info:", err);
      }
    };
    fetchPostInfo();
  }, [isLoggedIn, slug, backendUrl]);

  const handleLike = async () => {
    const token = sessionStorage.getItem("token");
    if (isLoggedIn && token) {
      try {
        const url = isLiked
          ? backendUrl + "/api/removelike"
          : backendUrl + "/api/addlike";
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ slug }),
        });
        if (response.ok) {
          setIsLiked(!isLiked);
        } else {
          console.error("Error updating like status:", response.statusText);
        }
      } catch (err) {
        console.error("Error updating like status:", err);
      }
    }
  };
  const handleSave = async () => {
    const token = sessionStorage.getItem("token");
    if (isLoggedIn && token) {
      try {
        const url = isSaved
          ? backendUrl + "/api/unsave"
          : backendUrl + "/api/save";
        console.log("Sending save/unsave request to:", url);
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ slug }),
        });
        if (response.ok) {
          const result = await response.json();
          console.log("Save/unsave response:", result);
          setIsSaved(!isSaved);
        } else {
          console.error("Error updating save status:", response.statusText);
        }
      } catch (err) {
        console.error("Error updating save status:", err);
      }
    }
  };
  useEffect(() => {
    const addLikeHandler = ({ post_id, user_id }: LikeEventData) => {
      console.log("ADD LIKE", post_id, user_id);
      setlikecount((prevCount) => prevCount + 1);
    };

    const removeLikeHandler = ({ post_id, user_id }: LikeEventData) => {
      console.log("REMOVE LIKE", post_id, user_id);
      setlikecount((prevCount) => prevCount - 1);
    };

    socket.on("add-like", addLikeHandler);
    socket.on("remove-like", removeLikeHandler);

    console.log("SOCKET IO", socket);
    return () => {
      socket.off("add-like", addLikeHandler);
      socket.off("remove-like", removeLikeHandler);
    };
  }, []);
  return (
    <>
      {isLoggedIn && postInfo ? (
        <div className="w-full max-w-3xl mx-auto">
          <header className="flex items-center justify-between py-4 border-b">
            <Link
              href="#"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
              prefetch={false}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to All Posts
            </Link>
          </header>
          <div className="py-8">
            <img
              src={postInfo.image_url}
              width={800}
              height={600}
              alt="Post Image"
              className="w-full h-auto rounded-lg object-cover"
            />
            <div className="mt-4 flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-lg font-medium">{postInfo.caption}</p>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback>{postInfo.initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  @{postInfo.username}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-4 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLike}
                className={`${
                  isLiked ? "text-red-500 hover:text-red-600" : ""
                }`}
              >
                <HeartIcon className="w-5 h-5" />
                <span className="sr-only">Like</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className={`${
                  isSaved ? "text-blue-500 hover:text-blue-600" : ""
                }`}
              >
                <BookmarkIcon className="w-5 h-5" filled={isSaved} />
                <span className="sr-only">Save</span>
              </Button>
              <Button variant="outline">
                <GiftIcon className="w-5 h-5 mr-2" />
                Gift
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{likecount} likes</span>
              <span className="text-sm text-gray-500">45 comments</span>
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
}
interface IconProps extends React.SVGProps<SVGSVGElement> {}
function ArrowLeftIcon(props: IconProps) {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function GiftIcon(props: IconProps) {
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
}

function HeartIcon(props: IconProps) {
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
}

function ReplyIcon(props: IconProps) {
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
      <polyline points="9 17 4 12 9 7" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  );
}
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
export default withAuth(Page);