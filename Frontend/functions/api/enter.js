function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function onRequestPost({ request }) {
  try {
    // Заглушка: всегда возвращаем, что пользователь существует и нужно показать главную страницу
    // Это позволяет работать без базы данных на этапе прототипа
    return jsonResponse({ 
      userData: { 
        result: 'showIndexPage',
        name: 'Садовод',
        tlgid: 0
      } 
    });
  } catch {
    return jsonResponse({ statusBE: 'notOk', error: 'Server error' }, 500);
  }
}