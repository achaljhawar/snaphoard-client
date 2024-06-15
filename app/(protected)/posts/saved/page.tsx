// app/instagram-feed/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { io } from "socket.io-client";
import Image from "next/image";
const backendUrl = process.env.NEXT_PUBLIC_BACKEND || "http://localhost:5000";
const socket = io(backendUrl, {
  reconnection: true,
});
import { useRouter } from "next/navigation";
interface Post {
  id: number;
  isSaved: boolean;
  isLiked: boolean;
  attachment_url: string;
  caption: string;
  username: string;
  initials: string;
  likecount: number;
}

interface LikeEventData {
  post_id: number;
  user_id: number;
}
import withAuth from "@/components/withAuth";

function Likedpostspage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [hasNoPosts, setHasNoPosts] = useState(false);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND;
    const router = useRouter();
  
    useEffect(() => {
      const fetchPosts = async () => {
        try {
          const token = sessionStorage.getItem("token");
          if (!token) {
            console.error("No user token found");
            return;
          }
  
          const response = await fetch(`${backendUrl}/api/getsavedposts`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (response.status === 404) {
            setHasNoPosts(true);
            return;
          }
  
          if (!response.ok) {
            throw new Error("Failed to fetch posts");
          }
  
          const data = await response.json();
          setPosts(data);
          setHasNoPosts(false);
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      };
  
      fetchPosts();
    }, [backendUrl]);
  const handleSave = async (postId: number, isSaved: boolean) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const url = isSaved
          ? `${backendUrl}/api/unsave`
          : `${backendUrl}/api/save`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ slug: postId }),
        });
        if (response.ok) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postId ? { ...post, isSaved: !isSaved } : post
            )
          );
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
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === post_id
            ? { ...post, likecount: post.likecount + 1 }
            : post
        )
      );
    };

    const removeLikeHandler = ({ post_id, user_id }: LikeEventData) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === post_id
            ? { ...post, likecount: post.likecount - 1 }
            : post
        )
      );
    };

    socket.on("add-like", addLikeHandler);
    socket.on("remove-like", removeLikeHandler);

    return () => {
      socket.off("add-like", addLikeHandler);
      socket.off("remove-like", removeLikeHandler);
    };
  }, []);
  
  const handleLike = async (postId: number, isLiked: boolean) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const url = isLiked
          ? `${backendUrl}/api/removelike`
          : `${backendUrl}/api/addlike`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ slug: postId }),
        });
        if (response.ok) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postId ? { ...post, isLiked: !isLiked } : post
            )
          );
        } else {
          console.error("Error updating like status:", response.statusText);
        }
      } catch (err) {
        console.error("Error updating like status:", err);
      }
    }
  };
  const handlePostclicks = (postId: number) => {
    router.push(`/posts/${postId}`);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <div className="grid gap-6 px-4 py-6 md:px-6 lg:py-12 md:py-8 max-w-3xl mx-auto">
            {hasNoPosts ? (
            <div className="flex justify-center items-center h-64">
            <p className="text-xl text-gray-500">You have no saved posts</p>
          </div>
            ):(
                <div className="grid gap-4">
                {posts.map((post) => (
                  <Card key={post.id} className="border-0 rounded-none shadow-none" >
                    <CardHeader className="p-2" onClick={() => handlePostclicks(post.id)}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
                          {post.initials}
                        </div>
                        <span className="font-medium">{post.username}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0" onClick={() => handlePostclicks(post.id)}>
                      <img
                        src={post.attachment_url}
                        width={800}
                        height={450}
                        alt="Post Image"
                        className="object-cover aspect-video rounded-t-lg"
                        onClick={() => handlePostclicks(post.id)}
                      />
                    </CardContent>
                    <CardFooter className="grid gap-2 p-2 pb-4">
                      <div className="flex items-center w-full">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleLike(post.id, post.isLiked)}
                        >
                          <HeartIcon
                            className={`w-4 h-4 ${
                              post.isLiked ? "text-red-500" : ""
                            }`}
                          />
                          <span className="sr-only">Like</span>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MessageCircleIcon className="w-4 h-4" />
                          <span className="sr-only">Comments</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSave(post.id, post.isSaved)}
                        >
                          <BookmarkIcon
                            className={`w-4 h-4 ${
                              post.isSaved ? "text-blue-500" : ""
                            }`}
                            filled={post.isSaved}
                          />
                          <span className="sr-only">Save</span>
                        </Button>
                        <span className="text-sm font-medium ml-2">
                          {post.likecount} likes
                        </span>
                      </div>
                      <div className="px-2 text-sm w-full">
                        <p>
                          <span className="font-bold">{post.username}</span>{" "}
                          {post.caption}
                        </p>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>   
            )}
        </div>
      </div>
    </main>
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

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
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

function MessageCircleIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function eyeicon(props: React.SVGProps<SVGSVGElement>) {
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    className="lucide lucide-eye"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>;
}
export default withAuth(Likedpostspage);