"use client";
// 배경 분위기 레이어 — 별먼지 + 오로라 색 웅덩이 + 비네트.
// 그래프(팬/줌) 뒤에 고정되어 깊이감을 만든다. 포인터 이벤트 없음.

// 결정적 의사난수 — 서버/클라 렌더 일치(하이드레이션 안전)
function seeded(i: number, salt: number): number {
  const a = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return a - Math.floor(a);
}

const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: +(seeded(i, 1) * 100).toFixed(2),
  y: +(seeded(i, 2) * 100).toFixed(2),
  size: +(1 + seeded(i, 3) * 1.7).toFixed(2),
  delay: +(seeded(i, 4) * 7).toFixed(2),
  dur: +(3.5 + seeded(i, 5) * 5).toFixed(2),
}));

const AURORAS = [
  {
    left: "-12%",
    top: "-18%",
    width: "55%",
    height: "62%",
    background:
      "radial-gradient(ellipse at center, rgba(78, 112, 196, 0.13), transparent 65%)",
    delay: "0s",
  },
  {
    right: "-14%",
    top: "4%",
    width: "52%",
    height: "66%",
    background:
      "radial-gradient(ellipse at center, rgba(176, 122, 224, 0.1), transparent 65%)",
    delay: "-8s",
  },
  {
    left: "6%",
    bottom: "-24%",
    width: "62%",
    height: "58%",
    background:
      "radial-gradient(ellipse at center, rgba(86, 164, 158, 0.1), transparent 65%)",
    delay: "-15s",
  },
  {
    right: "12%",
    bottom: "-12%",
    width: "40%",
    height: "44%",
    background:
      "radial-gradient(ellipse at center, rgba(203, 184, 147, 0.07), transparent 65%)",
    delay: "-4s",
  },
] as const;

export default function Starfield() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* 오로라 — 느리게 표류하는 색 웅덩이 */}
      {AURORAS.map((a, i) => (
        <div
          key={`aurora-${i}`}
          className="atlas-aurora"
          style={{ ...a, animationDelay: a.delay }}
        />
      ))}

      {/* 별먼지 — 반짝이는 점들 */}
      {STARS.map((s, i) => (
        <span
          key={`star-${i}`}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#e9e3d6",
            opacity: 0.5,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* 비네트 — 가장자리를 눌러 중앙으로 시선 집중 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 52%, rgba(4, 6, 9, 0.5) 100%)",
        }}
      />
    </div>
  );
}
