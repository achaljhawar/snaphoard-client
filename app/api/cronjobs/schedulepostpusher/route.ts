import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/db/supabase";
function convertDateTime(input: string): string {
  const date = new Date(input);
  date.setUTCHours(10, 10, 0, 0);
  const formattedDate = date.toISOString().replace(/\.\d{3}Z$/, "+00:00");
  return formattedDate;
}
function rectifyFormat(s: string) {
  let b = s.split(/\D/);
  return (
    b[0] +
    "-" +
    b[1] +
    "-" +
    b[2] +
    "T" +
    b[3] +
    ":" +
    b[4] +
    ":" +
    b[5] +
    "." +
    b[6].substr(0, 3) +
    "+00:00"
  );
}

export async function GET(request: NextRequest) {
  const now = new Date();

  try {
    const { data, error } = await supabase.from("scheduled_posts").select("*");
    if (error) {
      console.error("Error fetching scheduled posts:", error);
      throw error;
    }
    if (!data || data.length === 0) {
      console.log("No scheduled posts found.");
      return NextResponse.json({ message: "No scheduled posts found." });
    } else {
      for (const post of data) {
        const a = new Date(rectifyFormat(post.scheduled_at));
        if (a <= now){
          const { data: postdata, error: posterror } = await supabase
            .from("posts")
            .insert([
              {
                caption: post.caption,
                attachment_url: post.attachment_url,
                user_id: post.user_id,
              },
            ]);
          if (posterror) {
            console.error("Error inserting post:", posterror);
            return NextResponse.json(
              { error: "An error occurred while processing scheduled posts." },
              { status: 500 }
            );
          }
          const { data: deletedata, error: deleteerror } = await supabase
            .from("scheduled_posts")
            .delete()
            .eq("id", post.id);
          if (deleteerror) {
            console.error("Error deleting scheduled post:", deleteerror);
            return NextResponse.json(
              { error: "An error occurred while processing scheduled posts." },
              { status: 500 }
            );
          }
          return NextResponse.json({ message: "Scheduled posts processed." });
        }

      }
    }
  } catch (err) {
    console.error("Error during bulk operations:", err);
    return NextResponse.json(
      { error: "An error occurred while processing scheduled posts." },
      { status: 500 }
    );
  }
}
