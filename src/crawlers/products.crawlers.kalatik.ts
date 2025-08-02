export async function get_product_link(
  productName: string
): Promise<string | null> {
  try {
    const response = await fetch("/api/kalatik-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keyword: productName }),
    });

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const cards = doc.querySelectorAll("div.item-content");
    let bestScore = 0;
    let bestUrl: string | null = null;

    for (const card of Array.from(cards)) {
      const link = card.querySelector("a");
      if (!link) continue;

      const title = link.textContent?.trim() ?? "";
      const href = link.getAttribute("href") ?? "";

      const score = get_match_score(productName, title);
      if (score > bestScore) {
        bestScore = score;
        bestUrl = href;
      }
    }
    if (bestUrl && bestUrl.startsWith("/")) {
      bestUrl = `https://kalatik.com${bestUrl}`;
    }

    return bestUrl;
  } catch (err) {
    console.error("❌ get_product_link error:", err);
    return null;
  }
}

export async function get_price(
  productUrl: string
): Promise<Array<{ color: string; note: string; price: number }> | null> {
  try {
    const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(productUrl);
    const response = await fetch(proxyUrl);

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const guaranteeEl = doc.querySelector(
      ".btn-select-radio.active .combination-name"
    );
    const guarantee = guaranteeEl?.textContent?.trim() || "";

    const buttons = Array.from(
      doc.querySelectorAll(".btn-select-combination-color")
    );
    const results: Array<{ color: string; note: string; price: number }> = [];

    for (const btn of buttons) {
      const colorName = btn
        .querySelector(".combination-name")
        ?.textContent?.trim();
      if (!colorName) continue;

      const priceText = doc
        .querySelector("#price .price-value")
        ?.textContent?.replace(/,/g, "")
        .trim();
      const price =
        priceText && /^\d+$/.test(priceText) ? parseInt(priceText) * 10 : null;

      if (price) {
        results.push({
          color: colorName,
          note: guarantee,
          price,
        });
      }
    }

    return results.length > 0 ? results : null;
  } catch (err) {
    console.error("❌ get_price error:", err);
    return null;
  }
}

function get_match_score(a: string, b: string): number {
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
  if (a === b) return 100;
  if (b.includes(a)) return 80;
  return 0;
}
