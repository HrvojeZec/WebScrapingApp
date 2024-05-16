const Brand = require("../../model/brandModel");

const brandService = async () => {
  const result = await Brand.find();
  return result;
};

module.exports = brandService;
