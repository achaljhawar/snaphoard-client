"use client"

import withAuth from "@/components/withAuth";
import React, { FC } from "react";

const Page: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      hello
    </div>
  );
}
export default withAuth(Page);