const POLZA_API_BASE = 'https://api.polza.ai/api/v1';

const SYSTEM_PROMPT = [
  'Ты — умный помощник-садовод.',
  'Помогаешь планировать посадки и уход за садом и огородом по традициям лунного календаря.',
  'Даёшь рекомендации, а не гарантии результата. Пишешь спокойно, коротко и понятно.',
  'Не обещай «гарантированный урожай» и не используй мистические утверждения.',
  'Учитывай: корнеплоды лучше на убывающей Луне, зелень на растущей, плодовые от первой четверти до полнолуния.',
  'Неблагоприятные периоды: новолуние, полнолуние и 12 часов до/после.',
  'Если день неблагоприятен — предлагай ближайшие удачные даты.',
  'Всегда заканчивай ответ напоминанием: «Рекомендации основаны на традициях лунного календаря и дополняют агротехнику, климат и особенности вашего участка.»',
].join(' ');

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
        temperature: body?.temperature ?? 0.6,
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
