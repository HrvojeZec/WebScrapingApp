const express = require("express");
const { productService } = require("../product/product-service");
const router = express.Router();
let scapingInProgress = false;

router.get("/", async (req, res, next) => {
  if (scapingInProgress) {
    return res.status(400).json({ message: "Postupak je već u tijeku" });
  }
  try {
    scapingInProgress = true;
    await productService();
    await res.json({
      success: true,
      message: "Podaci uspješno spremljeni u bazu.",
    });
  } catch (error) {
    console.log(error);
  } finally {
    scapingInProgress = false;
  }
});

module.exports = router;
