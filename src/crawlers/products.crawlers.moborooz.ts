import axios from "axios";

export async function get_product_link(
  productName: string
): Promise<string | null> {
  try {
    const normalizedName = encodeURIComponent(productName.trim().toLowerCase());
    const url = `https://moborooz.com/api/system/livesearch?q=${normalizedName}&ajax=1`;

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const results = response.data;
    let bestScore = 0;
    let bestLink: string | null = null;

    for (const item of results) {
      if (item.mode !== "product") continue;

      const title = item.title || "";
      const score = getMatchScore(productName, title);

      if (score > bestScore) {
        bestScore = score;
        bestLink = item.link;
      }
    }

    return bestLink;
  } catch (error) {
    console.error("[Moborooz][get_product_link] Error:", error);
    return null;
  }
}

export async function get_price(productUrl: string): Promise<Array<{ color: string, price: number, note: string }> | null> {
  try {
    const response = await axios.get(productUrl);
    const parser = new DOMParser();
    const doc = parser.parseFromString(response.data, "text/html");

    const scriptTag = doc.querySelector('script[type="application/ld+json"]');
    if (!scriptTag?.textContent) return null;

    let jsonData;
    try {
      jsonData = JSON.parse(scriptTag.textContent);
    } catch {
      return null;
    }

    let productData = null;
    if (Array.isArray(jsonData)) {
      productData = jsonData.find(item => item["@type"] === "Product");
    } else if (jsonData["@type"] === "Product") {
      productData = jsonData;
    }

    if (!productData) return null;

    const offers = productData.offers?.offers;
    if (!Array.isArray(offers)) return null;

    const select = doc.querySelector("select#variant_id");
    const options = select?.querySelectorAll("option") || [];

    const prices: Array<{ color: string, price: number, note: string }> = [];

    options.forEach((opt, idx) => {
      const text = opt.textContent?.trim() || "";
      if (!text.includes("/")) return;

      const parts = text.split("/").map(p => p.trim()).filter(Boolean);
      const color = parts[0];
      const note = parts[1] || "نامشخص";

      const offer = offers[idx];
      const price = parseInt(offer?.price);

      if (!isNaN(price)) {
        prices.push({ color, price, note });
      }
    });

    return prices.length > 0 ? prices : null;
  } catch (error) {
    console.error("[Moborooz][get_price] Error:", error);
    return null;
  }
}

function getMatchScore(a: string, b: string): number {
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();

  if (a === b) return 100;
  if (b.includes(a)) return 90;

  let score = 0;
  const wordsA = a.split(" ");
  const wordsB = b.split(" ");

  wordsA.forEach((word) => {
    if (wordsB.includes(word)) score += 10;
  });

  return score;
}
