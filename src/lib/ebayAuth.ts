import { env } from 'process';

/**
 * Retrieves an access token from eBay's OAuth2 service.
 *
 * eBay APIs require a bearer token generated using your client ID and client
 * secret. This helper reads the `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET`
 * environment variables (or their `VITE_`-prefixed counterparts) and uses
 * them to perform a client credentials grant. The returned access token
 * typically remains valid for two hours and can be cached by the caller to
 * avoid redundant requests.
 */
export async function getEbayAccessToken(): Promise<string> {
  const clientId = env.EBAY_CLIENT_ID || env.VITE_EBAY_CLIENT_ID;
  const clientSecret = env.EBAY_CLIENT_SECRET || env.VITE_EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing EBAY_CLIENT_ID or EBAY_CLIENT_SECRET environment variables. Please set these in your .env file.'
    );
  }
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'https://api.ebay.com/oauth/api_scope/buy.browse',
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      `Failed to fetch eBay access token: ${data.error_description || response.statusText}`
    );
  }
  return data.access_token as string;
}
