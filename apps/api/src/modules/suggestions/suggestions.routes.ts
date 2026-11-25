import { Router } from "express";
import {
  LIMITS,
  suggestionsQuerySchema,
  type SuggestionsDto,
  type SuggestionsQuery,
} from "@storeseeker/shared";
import { Product } from "../../db/models/product";
import { validate } from "../../http/validate";
import { relevanceStages } from "../products/products.service";
import { searchTermsMatch } from "../products/search-filter";
import { enabledStores } from "../stores/stores.service";

const router = Router();

router.get("/suggestions", validate({ query: suggestionsQuerySchema }), async (_req, res) => {
  const { q } = res.locals.query as SuggestionsQuery;
  const stores = await enabledStores();
  const rows = await Product.aggregate<{ title: string }>([
    {
      $match: { available: true, storeSlug: { $in: [...stores.keys()] }, ...searchTermsMatch(q) },
    },
    ...relevanceStages(q),
    // The same product in several stores is one suggestion; $group keeps no order, so sort again
    {
      $group: {
        _id: "$searchText",
        title: { $first: "$title" },
        rank: { $first: "$rank" },
        firstId: { $first: "$_id" },
      },
    },
    { $sort: { rank: 1, title: 1, firstId: 1 } },
    { $limit: LIMITS.suggestionsMax },
  ]);
  const body: SuggestionsDto = { suggestions: rows.map((row) => row.title) };
  res.json(body);
});

export default router;
