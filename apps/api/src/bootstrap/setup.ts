import fs from "fs";
import path from "path";

const mallLogo = fs.readFileSync(path.resolve(__dirname, "../assets/mallLogo.svg"), "utf8");
const SanctaDomenicaLogo = fs.readFileSync(
  path.resolve(__dirname, "../assets/sanctaDomenicaLogo.svg"),
  "utf8",
);

export const StoresData = [
  {
    storeName: "Mall",
    logo: mallLogo,
  },
  {
    storeName: "Sancta Domenica",
    logo: SanctaDomenicaLogo,
  },
];
