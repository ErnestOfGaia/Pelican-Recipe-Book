import { eq } from 'drizzle-orm';
import { db } from './index';
import { quizQuestions, metrics } from './schema';

export type QuizQuestionRow = typeof quizQuestions.$inferSelect;

export async function getQuestionsForRecipe(recipeId: string): Promise<QuizQuestionRow[]> {
  return db.select().from(quizQuestions).where(eq(quizQuestions.recipe_id, recipeId));
}

export async function insertQuestions(
  recipeId: string,
  questions: {
    difficulty: 'easy' | 'hard';
    question_text: string;
    choices: string[];
    correct_index: number;
    source_field: string;
  }[],
): Promise<void> {
  if (!questions.length) return;
  await db.insert(quizQuestions).values(questions.map(q => ({ ...q, recipe_id: recipeId })));
}

export async function recordAnswer(data: {
  recipe_id: string;
  question_id: string;
  correct: boolean;
  role: string;
  language?: string;
}): Promise<void> {
  await db.insert(metrics).values({
    recipe_id: data.recipe_id,
    question_id: data.question_id,
    correct: data.correct,
    role: data.role,
    language: data.language ?? 'English',
  });
}
