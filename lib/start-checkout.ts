type CheckoutOptions = {
  successPath?: string;
  cancelPath?: string;
};

const hasOptions = (options?: CheckoutOptions) =>
  Boolean(options && (options.successPath || options.cancelPath));

export const startCheckout = async (options?: CheckoutOptions) => {
  const init: RequestInit = {
    method: "POST"
  };

  if (hasOptions(options)) {
    init.headers = {
      "Content-Type": "application/json"
    };
    init.body = JSON.stringify({
      successPath: options?.successPath,
      cancelPath: options?.cancelPath
    });
  }

  const response = await fetch("/api/purchase/start", init);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || typeof payload?.url !== "string" || payload.url.length === 0) {
    throw new Error(
      typeof payload?.error === "string" && payload.error.length > 0
        ? payload.error
        : "Unable to create payment order"
    );
  }

  return payload.url as string;
};
