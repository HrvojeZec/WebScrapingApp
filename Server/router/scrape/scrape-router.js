const express = require("express");
const scrapeService = require("./scrape-service");
const router = express.Router();
let scapingInProgress = false;
// pokrecemo scrapanje po trgovinama
//scrapeService scrapea po trgovina, te ubacuje u nasu bazu samo one proizvode koji fale
// te onim proizvodima kojima se cijena promjenila zamjeni za novu, pa pocetnu stavlja na staru cijenu
router.get("/", async (req, res, next) => {
  if (scapingInProgress) {
    return res.status(400).json({ message: "Postupak je već u tijeku" });
  }
  try {
    scapingInProgress = true;
    await scrapeService();
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
