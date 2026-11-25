import { Outlet } from "react-router";
import { SHELL_TEXT } from "../../model/constants";
import { DemoBanner } from "../DemoBanner/DemoBanner";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import classes from "./AppShell.module.scss";

const MAIN_ID = "sadrzaj";

/** Root layout of every page: header with search, the page, footer. */
export function AppShell() {
  return (
    <div className={classes.root}>
      <a href={`#${MAIN_ID}`} className={classes.skipLink}>
        {SHELL_TEXT.skipToContent}
      </a>
      <Header />
      <DemoBanner />
      <main id={MAIN_ID} className={classes.main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
