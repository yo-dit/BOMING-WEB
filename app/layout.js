import { Anton, DM_Sans } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "BOMING",
  description: "Website streaming film BOMING",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${anton.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}