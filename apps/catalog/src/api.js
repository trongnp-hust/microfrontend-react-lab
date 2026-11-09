
/* global __CATALOG_BFF_URL__ */
// Build-time public configuration. Never put service credentials in this value.
export async function getCatalog(signal) {
  const response = await fetch(__CATALOG_BFF_URL__ + '/api/catalog', { signal });
  if (!response.ok) throw new Error('BFF không khả dụng (HTTP ' + response.status + ').');
  return response.json();
}
