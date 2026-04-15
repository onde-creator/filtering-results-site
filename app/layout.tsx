export const metadata = {
  title: "필터링 결과 조회",
  description: "필터링 결과 조회 페이지",
};

import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
