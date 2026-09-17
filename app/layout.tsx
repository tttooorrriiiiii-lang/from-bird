import type { Metadata } from "next";
import "./globals.css";
import "./avatar.css";
import "./my-view.css";
import "./mypage-growth.css";
import "./complete.css";
export const metadata: Metadata = {
  title: "FROM BIRD｜考えることを、遊ぶ。",
  description: "言葉・色・かたち・物語・問いから考える、小さな実験室。",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="ja"><body>{children}</body></html>;
}
