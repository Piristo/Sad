export function onRequestGet() {
  const body = JSON.stringify({
    message: 'Welcome to the API',
    status: 'Server is running',
  });

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
