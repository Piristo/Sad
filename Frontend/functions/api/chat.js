import OpenAI from 'openai';

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return jsonResponse({ error: 'Message is required' }, 400);
    }

    if (!env.OPENAI_API_KEY) {
      return jsonResponse({ 
        reply: `[MOCK MODE] Я получил сообщение: "${message}". Для работы AI добавьте OPENAI_API_KEY в настройки Cloudflare Pages.` 
      });
    }

    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "Ты - умный агроном-помощник. Твоя задача - помогать пользователям с вопросами по садоводству, огороду, уходу за растениями. Давай краткие, точные и полезные советы. Используй дружелюбный тон." },
        { role: "user", content: message }
      ],
      model: "gpt-3.5-turbo",
    });

    return jsonResponse({ 
      reply: completion.choices[0].message.content 
    });

  } catch (err) {
    console.error('Chat Error:', err);
    return jsonResponse({ error: 'Failed to process chat message', details: err.message }, 500);
  }
}
