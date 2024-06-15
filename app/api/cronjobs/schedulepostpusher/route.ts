import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/db/supabase";

export async function GET(request: NextRequest) {
  const now = new Date();

  try {
    const { data, error } = await supabase
      .from("scheduled_posts")
      .select("*")
      .lte("scheduled_at", now.toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(50);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      const postsToInsert = data.map(post => ({
        user_id: post.user_id,
        caption: post.caption,
        attachment_url: post.attachment_url
      }));

      const { data: insertedPosts, error: insertError } = await supabase
        .from("posts")
        .insert(postsToInsert)
        .select();

      if (insertError) throw insertError;

      console.log(`Successfully published ${insertedPosts.length} posts.`);

      const scheduledPostIds = data.map(post => post.id);

      const { error: deleteError } = await supabase
        .from("scheduled_posts")
        .delete()
        .in("id", scheduledPostIds);

      if (deleteError) throw deleteError;

      return NextResponse.json({ 
        message: `Successfully published ${insertedPosts.length} posts.`,
        publishedCount: insertedPosts.length
      });
    } else {
      return NextResponse.json({ message: "No posts to publish at this time." });
    }
  } catch (err) {
    console.error("Error during bulk operations:", err);
    return NextResponse.json(
      { error: "An error occurred while processing scheduled posts." },
      { status: 500 }
    );
  }
}