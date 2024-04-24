const express = require("express");
const { productController } = require("../controller/product/product");
const router = express.Router();
let scapingInProgress = false;

router.get("/", async (req, res, next) => {
  if (scapingInProgress) {
    return res.status(400).json({ message: "Postupak je već u tijeku" });
  }
  try {
    scapingInProgress = true;
    await productController();
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
