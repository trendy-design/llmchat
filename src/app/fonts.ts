import { IBM_Plex_Mono, Inter } from "next/font/google";

export const inter = Inter({ subsets: ["latin"] });

export const ibmPlex = IBM_Plex_Mono({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
});
