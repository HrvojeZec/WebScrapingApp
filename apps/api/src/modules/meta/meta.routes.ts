import { Router } from "express";
import type { MetaDto } from "@storeseeker/shared";
import { Meta } from "../../db/models/meta";

const router = Router();

router.get("/meta", async (_req, res) => {
  const dataset = await Meta.findById("dataset").lean();
  const body: MetaDto = dataset
    ? { demo: dataset.demo, seededAt: dataset.seededAt.toISOString() }
    : { demo: false, seededAt: null };
  res.json(body);
});

export default router;
