import { cn } from "@/lib/utils";
import React from "react";

interface H3Props extends React.HTMLAttributes<HTMLHeadingElement> {}

export default function H3({ className, children, ...props }: H3Props) {
  return (
    <h3 className={cn("text-5xl font-bold", className)} {...props}>
      {children}
    </h3>
  );
}
