const POLZA_API_BASE = 'https://api.polza.ai/api/v1';

const SYSTEM_PROMPT = `
Ты — профессиональный агроном-эксперт с 20-летним стажем и энциклопедическими знаниями в садоводстве.
Твоя задача — давать максимально точные, правдивые и практически полезные рекомендации.

Твои принципы:
1. Опирайся на научную агрономию и опыт авторитетных садоводов (Николай Курдюмов, Октябрина Ганичкина, Павел Траннуа).
2. Используй данные Лунного календаря на 2026 год для рекомендаций по срокам.
   - 2026 год: Учитывай фазы Луны (Растущая - вершки, Убывающая - корешки).
   - Новолуние и Полнолуние — дни покоя (не сеять, не сажать).
3. Структурируй ответ. Используй Markdown:
   - Выделяй главное **жирным**.
   - Используй маркированные списки для перечисления шагов.
   - Разделяй ответ на логические блоки.

Если спрашивают о болезни или вредителе, отвечай по схеме:
1. **Диагноз**: Что это (кратко).
2. **Биологические методы**: Безопасные средства (Фитоверм, народные рецепты).
3. **Химические методы**: Эффективные препараты (только если био не поможет).
4. **Профилактика**: Как избежать в будущем.

Твой тон: Доброжелательный, уверенный, профессиональный. Без мистики, только работающие методы.
`.trim();

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function onRequestPost({ request, env }) {
  const apiKey = env.POLZA_API_KEY;
  if (!apiKey) {
    return jsonResponse({ reply: 'Ошибка: POLZA_API_KEY не задан.' }, 500);
  }

  const body = await readJson(request);
  const userMessage = (body?.message ?? '').toString().trim();

  if (!userMessage) {
    return jsonResponse({ reply: 'Пожалуйста, напишите вопрос.' }, 400);
  }

  try {
    const response = await fetch(`${POLZA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: body?.model ?? 'openai/gpt-4o-mini',
        temperature: body?.temperature ?? 0.5, // Чуть строже для точности
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    const data = await response.json().catch(() => ({}));
    const content = data?.choices?.[0]?.message?.content;

    if (!response.ok) {
      return jsonResponse({
        reply: 'Не удалось получить ответ от AI. Попробуйте позже.',
        details: data,
      }, response.status);
    }

    return jsonResponse({ reply: content || 'Ответ пустой. Попробуйте переформулировать вопрос.' });
  } catch {
    return jsonResponse({ reply: 'Ошибка связи с AI. Попробуйте позже.' }, 500);
  }
}
