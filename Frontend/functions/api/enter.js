import { getSupabase } from '../_lib/supabase.js';

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
  try {
    const body = await readJson(request);
    const tlgid = Number(body?.tlgid);

    if (!tlgid) {
      return jsonResponse({ statusBE: 'notOk', error: 'tlgid is required' }, 400);
    }

    const supabase = getSupabase(env);
    const { data: existing, error: selectError } = await supabase
      .from('users')
      .select('id,tlgid,name')
      .eq('tlgid', tlgid)
      .maybeSingle();

    if (selectError) {
      return jsonResponse({ statusBE: 'notOk', error: 'Database error' }, 500);
    }

    if (!existing) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({ tlgid });

      if (insertError) {
        return jsonResponse({ statusBE: 'notOk', error: 'Insert error' }, 500);
      }

      return jsonResponse({ userData: { result: 'showOnboarding' } });
    }

    const userData = {
      tlgid: existing.tlgid,
      name: existing.name ?? '',
      result: 'showIndexPage',
    };

    return jsonResponse({ userData });
  } catch {
    return jsonResponse({ statusBE: 'notOk', error: 'Server error' }, 500);
  }
}
