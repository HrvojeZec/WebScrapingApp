const express = require("express");
const scrapeService = require("./scrape-service");
const router = express.Router();
let scapingInProgress = false;
// pokrecemo scrapanje po trgovinama
//scrapeService scrapea po trgovina, te ubacuje u nasu bazu samo one proizvode koji fale
// te onim proizvodima kojima se cijena promjenila zamjeni za novu, pa pocetnu stavlja na staru cijenu
router.post("/", async (req, res, next) => {
  const { keyword } = req.body;
  console.log(keyword.length);
  if (keyword.length === 0) {
    return res.status(400).json({ message: "Unesite traženi proizvod." });
  }
  if (scapingInProgress) {
    return res.status(400).json({ message: "Postupak je već u tijeku" });
  }
  try {
    scapingInProgress = true;
    const response = await scrapeService({ keyword: keyword });

    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(400).json(response);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `nešto je pošlo po krivu ${error}`,
    });
  } finally {
    scapingInProgress = false;
  }
});

module.exports = router;
