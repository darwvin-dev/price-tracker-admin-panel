export async function get_product_link(
  productName: string
): Promise<string | null> {
  const normalizeDigits = (text: string) =>
    text.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));

  const normalizeText = (text: string) =>
    normalizeDigits(text)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .replace(/\s+/g, " ")
      .trim();

  const getMatchScore = (a: string, b: string): number => {
    a = normalizeText(a);
    b = normalizeText(b);

    if (a === b) return 100;
    if (b.includes(a)) return (a.length / b.length) * 100;

    let score = 0;
    const aWords = a.split(" ");
    aWords.forEach((aw) => {
      if (b.includes(aw)) score += 10;
    });

    return score;
  };

  try {
    const query = normalizeDigits(productName);
    const url = `https://shop.ctelecom.ir/api/component/SearchTermAutoComplete?term=${encodeURIComponent(
      query
    )}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const products = data?.Data?.Products ?? [];

    let bestScore = 0;
    let bestUrl: string | null = null;

    for (const item of products) {
      const title = item?.label || "";
      const link = item?.producturl;
      if (!title || !link) continue;

      const score = getMatchScore(productName, title);
      if (score > bestScore) {
        bestScore = score;
        bestUrl = "https://shop.ctelecom.ir" + link;
      }
    }

    return bestUrl;
  } catch (err) {
    console.error("❌ get_product_link_ctelecom error", err);
    return null;
  }
}

export async function get_price(
  productUrl: string
): Promise<Array<{ color: string; note: string; price: number }> | null> {
  try {
    const response = await fetch(productUrl);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const productIdInput = doc.querySelector<HTMLInputElement>(
      'input[name="productId"]'
    );
    const productId = productIdInput?.value;
    if (!productId) return null;

    const colorSelect = doc.querySelector("select.km-select-style");
    if (!colorSelect) return null;

    const colorOptions = Array.from(colorSelect.querySelectorAll("option"))
      .map((opt) => ({
        title: opt.textContent?.trim() || "",
        value: opt.getAttribute("value") || "",
      }))
      .filter((opt) => opt.value && opt.title);

    const warrantyOptions = Array.from(
      doc.querySelectorAll(
        "div.km-product-user-field.km-select-item span.km-item"
      )
    )
      .map((el) => {
        const title =
          el.querySelector("span.km-title")?.textContent?.trim() || "";
        const value =
          el.querySelector("input[type='radio']")?.getAttribute("value") || "";
        return title && value ? { title, value } : null;
      })
      .filter(Boolean) as Array<{ title: string; value: string }>;

    const results: Array<{ color: string; note: string; price: number }> = [];

    for (const color of colorOptions) {
      for (const warranty of warrantyOptions) {
        const url = `https://shop.ctelecom.ir/shoppingcart/productdetails_attributechange?productId=${productId}&attributeValueId=${color.value}&validateAttributeConditions=True&loadPicture=True`;

        const form = new URLSearchParams();
        form.append("product_attribute_55290", warranty.value);

        try {
          const resp = await fetch(url, {
            method: "POST",
            body: form,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          });
          const data = await resp.json();
          const priceText = data?.price || "";
          const price = parseInt(priceText.replace(/[^\d]/g, ""));
          if (!isNaN(price)) {
            results.push({
              color: color.title,
              note: warranty.title,
              price: price * 10,
            });
          }
        } catch (err) {
          console.warn("❌ price fetch failed", err);
        }
      }
    }

    return results.length > 0 ? results : null;
  } catch (err) {
    console.error("❌ get_price_ctelecom error", err);
    return null;
  }
}
