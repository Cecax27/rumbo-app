import { Quicksand, Figtree} from "next/font/google";

const quicksand = Quicksand({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export { quicksand, figtree };