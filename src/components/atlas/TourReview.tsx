"use client";
import { useState } from "react";
import { TOUR_REVIEW } from "@/lib/tour-review";

export default function TourReview({ slug }: { slug: string }) {
  const questions = TOUR_REVIEW[slug];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  if (!questions?.length) return null;
  const complete = questions.every((_, i) => answers[i] !== undefined);
  return <section className="atlas-review" aria-label="투어 복습">
    <h4>두 질문으로 돌아보기</h4>
    <p>방금 읽은 내용을 확인해 보세요. 복습은 선택 사항이에요.</p>
    {questions.map((question, index) => <fieldset key={question.prompt}>
      <legend>{index + 1}. {question.prompt}</legend>
      {question.choices.map((choice, option) => <label key={choice}>
        <input type="radio" name={`review-${slug}-${index}`} checked={answers[index] === option}
          disabled={checked} onChange={() => setAnswers(previous => ({ ...previous, [index]: option }))} />
        {choice}
      </label>)}
      {checked && <p className="atlas-review-feedback">
        <strong>{answers[index] === question.answer ? "맞았어요." : `다시 살펴봐요. 정답: ${question.choices[question.answer]}`}</strong>{" "}
        {question.explanation}
      </p>}
    </fieldset>)}
    <div role="status">{checked ? `${questions.length}문항 중 ${questions.filter((q, i) => answers[i] === q.answer).length}문항을 맞혔어요. 아래 해설과 투어를 다시 읽어보세요.` : ""}</div>
    <button type="button" className="atlas-button" disabled={!complete && !checked}
      onClick={() => { if (checked) { setAnswers({}); setChecked(false); } else setChecked(true); }}>
      {checked ? "다시 풀기" : "정답과 해설 확인"}
    </button>
  </section>;
}
