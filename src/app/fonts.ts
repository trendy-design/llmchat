import { IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";

export const interVar = localFont({
  src: "./InterVariable.woff2",
  variable: "--font-inter",
});

// export const inter = Inter({ subsets: ["latin"] });

export const ibmPlex = IBM_Plex_Mono({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
});
