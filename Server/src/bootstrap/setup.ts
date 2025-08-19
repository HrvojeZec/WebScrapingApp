const fs = require('fs');
const path = require('path');
const mallLogo = fs.readFileSync(
  path.resolve(__dirname, '../assets/mallLogo.svg'),
  'utf8',
);
const SanctaDomenicaLogo = fs.readFileSync(
  path.resolve(__dirname, '../assets/sanctaDomenicaLogo.svg'),
  'utf8',
);

export const StoresData = [
  {
    storeName: 'Mall',
    logo: mallLogo,
  },
  {
    storeName: 'Sancta Domenica',
    logo: SanctaDomenicaLogo,
  },
];

module.exports = { StoresData };
