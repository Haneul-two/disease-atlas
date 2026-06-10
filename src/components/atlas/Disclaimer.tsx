// 교육용·비의학적 고지 — 모든 화면에 고정 노출 (설계 §7 안전장치)
export default function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p
      className={`text-xs leading-relaxed text-amber-700 dark:text-amber-400/90 ${className}`}
    >
      ⚠️ 이 사이트는 <strong>교육용</strong>이며 의학적 조언이 아닙니다. 진단·치료는
      반드시 전문 의료인과 상담하세요.
    </p>
  );
}
