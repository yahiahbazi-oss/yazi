/**
 * Navex Delivery API Integration
 * Tunisia delivery service integration for Yazi
 */

const NAVEX_BASE_URL = "https://app.navex.tn/api";

// API Tokens - these should be in environment variables
const TOKENS = {
  CREATE: process.env.NAVEX_TOKEN_CREATE || "yazicolllection-0MTH51G4J9R5M02RAAO7Y252PDWECZ1D",
  TRACK: process.env.NAVEX_TOKEN_TRACK || "yazicolllection-etat-0MTH51G4J9R5M02RAAO7Y252PDWECZ1D",
  DELETE: process.env.NAVEX_TOKEN_DELETE || "yazicolllection-delete-0MTH51G4J9R5M02RAAO7Y252PDWECZ1D",
};

/**
 * Create a delivery order in Navex system
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>} Response with tracking code
 */
export async function createNavexDelivery(orderData) {
  const {
    prix,
    nom,
    gouvernerat,
    ville,
    adresse,
    tel,
    tel2 = "",
    designation,
    nb_article,
    msg = "",
    echange = "",
    article = "",
    nb_echange = "",
    ouvrir = "Non",
    sender_name = "",
    sender_location = "",
    sender_gouvernorat = "",
  } = orderData;

  // Build form data
  const formData = new URLSearchParams();
  formData.append("prix", prix);
  formData.append("nom", nom);
  formData.append("gouvernerat", gouvernerat);
  formData.append("ville", ville);
  formData.append("adresse", adresse);
  formData.append("tel", tel);
  formData.append("tel2", tel2);
  formData.append("designation", designation);
  formData.append("nb_article", nb_article);
  formData.append("msg", msg);
  formData.append("echange", echange);
  formData.append("article", article);
  formData.append("nb_echange", nb_echange);
  formData.append("ouvrir", ouvrir);
  formData.append("sender_name", sender_name);
  formData.append("sender_location", sender_location);
  formData.append("sender_gouvernorat", sender_gouvernorat);

  const url = `${NAVEX_BASE_URL}/${TOKENS.CREATE}/v1/post.php`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (response.ok && data.status) {
      return {
        success: true,
        trackingCode: data.status_message,
        data,
      };
    }

    return {
      success: false,
      error: data.status_message || "Failed to create delivery",
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Track a single delivery by code
 * @param {string} code - Tracking code
 * @param {Object} options - Optional params (include_prix, include_echange, include_date)
 * @returns {Promise<Object>} Delivery status
 */
export async function trackNavexDelivery(code, options = {}) {
  const formData = new URLSearchParams();
  formData.append("code", code);

  if (options.include_prix) formData.append("include_prix", "1");
  if (options.include_echange) formData.append("include_echange", "1");
  if (options.include_date) formData.append("include_date", "1");

  const url = `${NAVEX_BASE_URL}/${TOKENS.TRACK}/v1/post.php`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (response.ok && data.status === 1) {
      return {
        success: true,
        tracking: {
          code: code,
          status: data.etat,
          reason: data.motif,
          previousStatus: data.pre_etat,
          previousReason: data.pre_motif,
          driver: data.livreur,
          driverPhone: data.livreur_tel,
          price: data.prix,
          exchangeCode: data.code_echange,
          exchangeDate: data.date_echange,
          statusDate: data.date_dernier_statut,
        },
        data,
      };
    }

    return {
      success: false,
      error: data.status_message || "Delivery not found",
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Track multiple deliveries at once
 * @param {string[]} codes - Array of tracking codes
 * @returns {Promise<Object>} Multiple delivery statuses
 */
export async function trackMultipleNavexDeliveries(codes) {
  const codesString = codes.join(", ");
  const formData = new URLSearchParams();
  formData.append("codes", codesString);

  const url = `${NAVEX_BASE_URL}/${TOKENS.TRACK}/v1/post.php`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (response.ok && data.status === 1) {
      return {
        success: true,
        total: data.total,
        results: data.results.map((r) => ({
          code: r.code,
          found: r.status === 1,
          status: r.etat,
          reason: r.motif,
          previousStatus: r.pre_etat,
          previousReason: r.pre_motif,
          driver: r.livreur,
          driverPhone: r.livreur_tel,
          message: r.status_message,
        })),
        data,
      };
    }

    return {
      success: false,
      error: "Failed to track deliveries",
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete a delivery order
 * @param {string} code - Tracking code to delete
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteNavexDelivery(code) {
  const formData = new URLSearchParams();
  formData.append("delete_code", code);

  const url = `${NAVEX_BASE_URL}/${TOKENS.DELETE}/v1/post.php`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (response.ok && data.status) {
      return {
        success: true,
        message: data.status_message,
        data,
      };
    }

    return {
      success: false,
      error: data.status_message || "Failed to delete delivery",
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get list of all pending deliveries
 * @returns {Promise<Object>} List of pending deliveries
 */
export async function getPendingNavexDeliveries() {
  const formData = new URLSearchParams();
  formData.append("getattente", "1");

  const url = `${NAVEX_BASE_URL}/${TOKENS.TRACK}/v1/post.php`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (response.ok && data.status === 1) {
      return {
        success: true,
        total: data.total,
        deliveries: data.colis.map((c) => ({
          trackingCode: c.code_barre,
          designation: c.designation,
          price: c.prix,
        })),
        data,
      };
    }

    return {
      success: false,
      error: "Failed to get pending deliveries",
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Convert Yazi order to Navex format
 * @param {Object} order - Yazi order object
 * @returns {Object} Navex-formatted data
 */
export function convertOrderToNavexFormat(order) {
  // Calculate total articles
  const nb_article = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 1;

  // Build designation (product list)
  const designation = order.items
    ?.map((item) => `${item.name} (${item.size}) x${item.quantity}`)
    .join(", ") || order.order_number;

  return {
    prix: order.total_amount.toString(),
    nom: order.customer_name,
    gouvernerat: order.governorate,
    ville: "", // Extract from address if needed
    adresse: order.address,
    tel: order.phone,
    tel2: order.phone2 || "",
    designation: designation,
    nb_article: nb_article.toString(),
    msg: order.note || "",
    echange: "", // Set to "Oui" if exchange is allowed
    article: "", // Specific article for exchange
    nb_echange: "", // Number of exchange items
    ouvrir: "Non", // "Oui" if customer can open package before paying
    sender_name: "YAZI Collection",
    sender_location: "", // Your warehouse address
    sender_gouvernorat: "", // Your warehouse governorate
  };
}
