import type { Metadata } from "next";
import { Fraunces, Gowun_Batang, IBM_Plex_Sans_KR, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// 라틴 디스플레이/숫자 — 광학적 세리프, 도판 번호·플레이트 마크에 사용
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--f-fraunces",
  display: "swap",
});

// 한글 디스플레이 — 명조(제목·질병명)
const gowunBatang = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--f-gowun",
  display: "swap",
});

// 본문/UI — 한글+라틴 (기술적·과학적 산세리프)
const plexSansKr = IBM_Plex_Sans_KR({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--f-plex-kr",
  display: "swap",
});

// 메타데이터/라벨 — 표본 태그·키 코드
const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--f-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "질병 아틀라스 — 인체 부위별 질병 관계 지도",
  description:
    "인체 부위별 주요 질병을 해부학적으로 배치된 관계 그래프로 보고, 용어·증상·치료법을 열람하는 교육용 사이트.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${fraunces.variable} ${gowunBatang.variable} ${plexSansKr.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
