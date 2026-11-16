import Collections from "@/lib/models/Collections";

export const defaultProductPageSize = 24;
export const maxProductPageSize = 100;

export function parseProductPagination(searchParams: URLSearchParams) {
  const rawPage = searchParams.get("page");
  const rawLimit = searchParams.get("limit");
  const page = rawPage === null ? 1 : Number(rawPage);
  const limit =
    rawLimit === null ? defaultProductPageSize : Number(rawLimit);

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > maxProductPageSize
  ) {
    return null;
  }

  return { page, limit };
}

export async function findProductPage(
  filter: Record<string, unknown>,
  page: number,
  limit: number,
  includeDetails = false,
) {
  const select = includeDetails
    ? "_id title description price img category discount sizes rating createdAt"
    : "_id title price img discount category";
  const query = Collections.find(filter)
    .select(select)
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const countQuery = Collections.countDocuments(filter);

  if ("category" in filter) {
    query.collation({ locale: "en", strength: 2 });
    countQuery.collation({ locale: "en", strength: 2 });
  }

  const [products, totalCount] = await Promise.all([
    query.lean(),
    countQuery,
  ]);

  return {
    products: includeDetails
      ? products.map((product) => ({
          ...product,
          availability: product.sizes.some((size) => size.stock > 0),
        }))
      : products,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
}
