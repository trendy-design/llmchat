import localFont from "next/font/local";

export const interVar = localFont({
  src: "./InterVariable.woff2",
  variable: "--font-inter",
});

// export const inter = Inter({ subsets: ["latin"] });

export const mono = localFont({
  src: "./JetBrainsMono-Regular.woff2",
  variable: "--font-mono",
});
