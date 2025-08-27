import { getEbayAccessToken } from './ebayAuth';

export interface EbayItem {
  itemId: string;
  title: string;
  price: { value: number; currency: string };
  itemWebUrl: string;
  condition: string;
}

interface EbayItemSummary {
  itemId: string;
  title: string;
  price: { value: number; currency: string };
  itemWebUrl: string;
  condition?: string;
}

export async function searchComics(
  query: string,
  limit = 10
): Promise<EbayItem[]> {
  if (!query.trim()) {
    return [];
  }
  const token = await getEbayAccessToken();
  const marketplaceId = process.env.EBAY_MARKETPLACE_ID || 'EBAY_GB';
  const url = new URL('https://api.ebay.com/buy/browse/v1/item_summary/search');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('category_ids', '1');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': marketplaceId,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    const message = data?.errors?.[0]?.message || response.statusText;
    throw new Error(`eBay search failed: ${message}`);
  }
  return (data.itemSummaries || []).map((item: EbayItemSummary) => ({
    itemId: item.itemId,
    title: item.title,
    price: item.price,
    itemWebUrl: item.itemWebUrl,
    condition: item.condition || 'Unknown',
  })) as EbayItem[];
}
