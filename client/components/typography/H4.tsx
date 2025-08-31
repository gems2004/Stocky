import { cn } from "@/lib/utils";
import React from "react";

interface H4Props extends React.HTMLAttributes<HTMLHeadingElement> {}

export default function H4({ className, children, ...props }: H4Props) {
  return (
    <h4 className={cn("text-4xl font-bold", className)} {...props}>
      {children}
    </h4>
  );
}
