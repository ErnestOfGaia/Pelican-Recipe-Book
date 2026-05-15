import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const recipes = sqliteTable('recipes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  recipe_type: text('recipe_type').notNull(), // 'Core' | 'Specials' — used by FOH view
  station: text('station'), // 'Saute' | 'Grill' | 'Fryer' | 'Pantry' | 'Pizza'
  is_new: integer('is_new', { mode: 'boolean' }).notNull().default(false),
  yield: text('yield'),
  prep_time: text('prep_time'),
  shelf_life: text('shelf_life'),
  original_date: text('original_date'),
  revision_date: text('revision_date'),
  ingredients: text('ingredients', { mode: 'json' }).$type<string[]>().notNull().default([]),
  plateware: text('plateware'),
  cook_steps: text('cook_steps', { mode: 'json' }).$type<string[]>().notNull().default([]),
  plate_steps: text('plate_steps', { mode: 'json' }).$type<string[]>().notNull().default([]),
  allergens: text('allergens', { mode: 'json' }).$type<string[]>(),
  marketing_lore: text('marketing_lore'),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('published'),
  created_at: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const quizQuestions = sqliteTable('quiz_questions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  recipe_id: text('recipe_id').notNull().references(() => recipes.id),
  difficulty: text('difficulty', { enum: ['easy', 'hard'] }).notNull(),
  question_text: text('question_text').notNull(),
  question_text_es: text('question_text_es'), // V2
  choices: text('choices', { mode: 'json' }).$type<string[]>().notNull(),
  choices_es: text('choices_es', { mode: 'json' }).$type<string[]>(), // V2
  correct_index: integer('correct_index').notNull(),
  source_field: text('source_field').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const metrics = sqliteTable('metrics', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  recipe_id: text('recipe_id').notNull().references(() => recipes.id),
  question_id: text('question_id').notNull().references(() => quizQuestions.id),
  correct: integer('correct', { mode: 'boolean' }).notNull(),
  role: text('role').notNull(),
  language: text('language').notNull().default('English'),
  created_at: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const roleSessions = sqliteTable('role_sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  role: text('role').notNull(),
  started_at: integer('started_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  ended_at: integer('ended_at', { mode: 'timestamp' }),
});

export const recipeViews = sqliteTable('recipe_views', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  recipe_id: text('recipe_id').notNull().references(() => recipes.id),
  viewed_at: integer('viewed_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
