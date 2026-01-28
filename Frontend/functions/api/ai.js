const POLZA_API_BASE = 'https://api.polza.ai/api/v1';

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
    return jsonResponse({ error: 'POLZA_API_KEY is missing' }, 500);
  }

  const body = await readJson(request);
  const messages = Array.isArray(body?.messages) ? body.messages : null;
  const model = body?.model ?? 'openai/gpt-4o-mini';

  if (!messages || messages.length === 0) {
    return jsonResponse({ error: 'messages array is required' }, 400);
  }

  try {
    const response = await fetch(`${POLZA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: body?.temperature ?? 0.6,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return jsonResponse(
        { error: 'Polza API error', details: data },
        response.status,
      );
    }

    return jsonResponse(data);
  } catch (error) {
    return jsonResponse({ error: 'Request failed' }, 500);
  }
}
