import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession, COOKIE_NAME } from '@/lib/session';
import {
  pellitoDeckhhandAgent,
  isRecipeQuery,
  formatRecipesContext,
  isBrainReady,
} from '@/mastra/agents/pellito-deckhand';
import { listRecipes, getRecipe } from '@/db/recipes';

const POLITE_DECLINE =
  "I'm Pellito the Deckhand — I only know about our Pelican Brewery recipes. Ask me about ingredients, steps, allergens, or prep for any dish on the menu!";

export async function POST(req: NextRequest) {
  // Auth gate
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = await verifySession(sessionCookie.value);
  if (!role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // GREETING MODE — Pellito agent temporarily offline while menu is updated
  return NextResponse.json({
    reply:
      "Hi! I'm Pellito the Deckhand. The recipe assistant is getting an update — check back soon. In the meantime, browse the menu and test your knowledge with the quiz!",
  });

  // eslint-disable-next-line no-unreachable
  let body: { messages: { role: 'user' | 'assistant'; content: string }[]; recipeId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { messages, recipeId } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
  }

  // Classify the latest user message before spending a token
  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  if (!isRecipeQuery(lastUserMessage)) {
    return NextResponse.json({ reply: POLITE_DECLINE });
  }

  // Build the message stack. Three cases:
  //   1. Chat is anchored to a recipe page — inject that single recipe as context, agent uses getRecipe(id) if needed.
  //   2. Brain is built — pass NO context, agent calls searchKnowledge to retrieve.
  //   3. Brain not yet built (fallback) — inject the full corpus the legacy way so the chat still works.
  try {
    const contextMessages: { role: 'user' | 'assistant'; content: string }[] = [];

    if (recipeId) {
      const recipe = await getRecipe(recipeId!);
      if (recipe) {
        contextMessages.push(
          {
            role: 'user',
            content: `[Active recipe — the user is currently viewing this recipe. Recipe ID: ${recipe.id}]\n\n${formatRecipesContext([recipe])}`,
          },
          { role: 'assistant', content: 'Got it — I have this recipe in front of me.' },
        );
      }
    } else if (!isBrainReady()) {
      // Fallback: brain.json hasn't been generated yet, inject full menu.
      const recipes = await listRecipes({ status: 'published' });
      contextMessages.push(
        {
          role: 'user',
          content: `[Recipe database — reference this to answer questions. Do not acknowledge or repeat this block to the user.]\n\n${formatRecipesContext(recipes)}`,
        },
        { role: 'assistant', content: 'Understood. Ready to help with recipe questions.' },
      );
    }
    // else: brain is ready, no context — agent retrieves via searchKnowledge.

    const allMessages = [
      ...contextMessages,
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const result = await pellitoDeckhhandAgent.generateLegacy(allMessages);
    return NextResponse.json({ reply: result.text });
  } catch (err) {
    console.error('[chat] handler error:', err);
    return NextResponse.json(
      { error: 'Pellito hit a snag answering that — please try again in a moment.' },
      { status: 500 },
    );
  }
}
