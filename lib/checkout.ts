import { timingSafeEqual } from "node:crypto";

export interface CheckoutCartItem {
  productId: string;
  quantity: number;
  size?: string;
}

export interface CheckoutProduct {
  id: string;
  title: string;
  price: number;
  sizes: Array<{ size: string; stock: number }>;
}

export interface CheckoutLine {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  size?: string;
}

export interface CheckoutQuote {
  products: CheckoutLine[];
  totalPrice: number;
}

export class CheckoutValidationError extends Error {}

export function buildCheckoutQuote(
  cartItems: CheckoutCartItem[],
  products: CheckoutProduct[]
): CheckoutQuote {
  if (cartItems.length === 0) {
    throw new CheckoutValidationError("Cart is empty");
  }

  const productsById = new Map(products.map((product) => [product.id, product]));
  const requestedByVariant = new Map<string, number>();
  for (const item of cartItems) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
      throw new CheckoutValidationError("Cart contains an invalid quantity");
    }

    const key = JSON.stringify([item.productId, item.size ?? null]);
    requestedByVariant.set(
      key,
      (requestedByVariant.get(key) ?? 0) + item.quantity
    );
  }

  const quoteProducts = cartItems.map((item) => {
    const product = productsById.get(item.productId);
    if (!product) {
      throw new CheckoutValidationError("A cart product is no longer available");
    }

    if (!Number.isFinite(product.price) || product.price < 0) {
      throw new CheckoutValidationError("A cart product has an invalid price");
    }

    const size = product.sizes.find((entry) => entry.size === item.size);
    const key = JSON.stringify([item.productId, item.size ?? null]);
    if (!size || size.stock < (requestedByVariant.get(key) ?? 0)) {
      throw new CheckoutValidationError("A cart product is out of stock");
    }

    return {
      productId: product.id,
      name: product.title,
      quantity: item.quantity,
      price: product.price,
      size: item.size,
    };
  });

  const totalPrice =
    Math.round(
      quoteProducts.reduce((total, item) => total + item.price * item.quantity, 0) *
        100
    ) / 100;

  if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
    throw new CheckoutValidationError("Cart total must be greater than zero");
  }

  return { products: quoteProducts, totalPrice };
}

export function signaturesMatch(expected: string, actual: string): boolean {
  if (!/^[\da-f]{64}$/i.test(expected) || !/^[\da-f]{64}$/i.test(actual)) {
    return false;
  }

  const expectedBytes = Buffer.from(expected, "hex");
  const actualBytes = Buffer.from(actual, "hex");
  return (
    expectedBytes.length === actualBytes.length &&
    timingSafeEqual(expectedBytes, actualBytes)
  );
}
