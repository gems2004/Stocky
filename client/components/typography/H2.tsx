import { cn } from "@/lib/utils";
import React from "react";

interface H2Props extends React.HTMLAttributes<HTMLHeadingElement> {}

export default function H2({ className, children, ...props }: H2Props) {
  return (
    <h2 className={cn("text-6xl font-bold", className)} {...props}>
      {children}
    </h2>
  );
}
