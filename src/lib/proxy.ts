export function validateApiKey(headers: Headers): boolean {
  const apiKey = headers.get('x-api-key');
  const expectedKey = process.env.API_KEY || 'sterling-secret-key-101';
  return !!apiKey && apiKey === expectedKey;
}
