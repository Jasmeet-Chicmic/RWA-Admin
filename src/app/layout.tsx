import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "next-themes";
import { DM_Sans } from "next/font/google";
import FcmProvider from "./FcmProvider";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import Web3Provider from "@/components/providers/Web3Provider";
import ReduxProvider from "./ReduxProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  title: "RWA Admin",
  description: "RWA Admin Template",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={dmSans.variable}>
      <body>
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <Web3Provider>
              <ReduxProvider>
                {children}
                <ToastContainer position="top-right" />
                <FcmProvider />
              </ReduxProvider>
            </Web3Provider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
