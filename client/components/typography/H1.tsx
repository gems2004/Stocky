import { cn } from "@/lib/utils";
import React from "react";

interface H1Props extends React.HTMLAttributes<HTMLHeadingElement> {}

export default function H1({ className, children, ...props }: H1Props) {
  return (
    <h1 className={cn("text-7xl font-bold", className)} {...props}>
      {children}
    </h1>
  );
}
