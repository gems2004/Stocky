import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/QueryProvider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Stocky",
  description: "A shop management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <QueryProvider>
          <div>{children}</div>
          <Toaster 
            toastOptions={{
              classNames: {
                toast: '!bg-background !text-foreground !border !border-border',
                success: '!bg-primary !text-primary-foreground',
                error: '!bg-destructive !text-white',
                info: '!bg-accent !text-accent-foreground',
                warning: '!bg-yellow-500 !text-yellow-500-foreground',
                description: '!text-white',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
