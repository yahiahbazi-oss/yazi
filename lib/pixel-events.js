// Meta Pixel event helpers
export function trackViewContent(product) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      value: product.price,
      currency: "TND",
    });
  }
}

export function trackAddToCart(product, quantity) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "AddToCart", {
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      value: product.price * quantity,
      currency: "TND",
    });
  }
  // Google Ads
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "add_to_cart", {
      currency: "TND",
      value: product.price * quantity,
      items: [{ item_id: product.id, item_name: product.name, quantity }],
    });
  }
}

export function trackInitiateCheckout(items, totalPrice) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      content_ids: items.map((i) => i.productId),
      content_type: "product",
      num_items: items.length,
      value: totalPrice,
      currency: "TND",
    });
  }
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "begin_checkout", {
      currency: "TND",
      value: totalPrice,
    });
  }
}

export function trackPurchase(orderNumber, items, totalPrice) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Purchase", {
      content_ids: items.map((i) => i.productId),
      content_type: "product",
      num_items: items.reduce((sum, i) => sum + i.quantity, 0),
      value: totalPrice,
      currency: "TND",
    });
  }
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: orderNumber,
      currency: "TND",
      value: totalPrice,
      items: items.map((i) => ({
        item_id: i.productId,
        item_name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    });
  }
}
