import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCheckoutQuote,
  CheckoutValidationError,
  signaturesMatch,
} from "./checkout.ts";

describe("buildCheckoutQuote", () => {
  it("uses current catalog prices and names for the checkout snapshot", () => {
    const quote = buildCheckoutQuote(
      [{ productId: "product-1", quantity: 2, size: "M" }],
      [
        {
          id: "product-1",
          title: "Catalog title",
          price: 19.99,
          sizes: [{ size: "M", stock: 3 }],
        },
      ]
    );

    assert.deepEqual(quote, {
      products: [
        {
          productId: "product-1",
          name: "Catalog title",
          quantity: 2,
          price: 19.99,
          size: "M",
        },
      ],
      totalPrice: 39.98,
    });
  });

  it("rejects unavailable products, invalid quantities, and insufficient stock", () => {
    const product = {
      id: "product-1",
      title: "Catalog title",
      price: 19.99,
      sizes: [{ size: "M", stock: 1 }],
    };

    assert.throws(
      () =>
        buildCheckoutQuote(
          [{ productId: "product-1", quantity: 2, size: "M" }],
          [product]
        ),
      CheckoutValidationError
    );
    assert.throws(
      () =>
        buildCheckoutQuote(
          [{ productId: "missing", quantity: 1, size: "M" }],
          [product]
        ),
      CheckoutValidationError
    );
    assert.throws(
      () =>
        buildCheckoutQuote(
          [{ productId: "product-1", quantity: 1.5, size: "M" }],
          [product]
        ),
      CheckoutValidationError
    );
    assert.throws(
      () =>
        buildCheckoutQuote(
          [
            { productId: "product-1", quantity: 1, size: "M" },
            { productId: "product-1", quantity: 1, size: "M" },
          ],
          [product]
        ),
      CheckoutValidationError
    );
  });
});

describe("signaturesMatch", () => {
  it("accepts matching hex signatures and rejects malformed or differing values", () => {
    const signature = "a".repeat(64);

    assert.equal(signaturesMatch(signature, signature), true);
    assert.equal(signaturesMatch(signature, "b".repeat(64)), false);
    assert.equal(signaturesMatch(signature, "not-a-signature"), false);
  });
});
