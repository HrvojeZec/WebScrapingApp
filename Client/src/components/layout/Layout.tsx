import { PropsWithChildren } from "react";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";

function Layout(props:PropsWithChildren) {
  return (
    <div>
      <Header />
      <main>{props.children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
