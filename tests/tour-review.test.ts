import { test } from "node:test";
import assert from "node:assert/strict";
import { TOURS } from "../src/lib/tours";
import { TOUR_REVIEW } from "../src/lib/tour-review";

test("각 투어에는 유효한 정답과 해설을 가진 복습 두 문항이 있다", () => {
  for (const tour of TOURS) {
    const questions = TOUR_REVIEW[tour.slug];
    assert.equal(questions?.length, 2, tour.slug);
    for (const question of questions) {
      assert.ok(question.choices[question.answer]);
      assert.equal(new Set(question.choices).size, question.choices.length);
      assert.ok(question.explanation.trim().length > 0);
    }
  }
});
