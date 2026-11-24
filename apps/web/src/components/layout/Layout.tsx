import React from "react";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";

interface Props{
  children: React.ReactNode;
}

function Layout(props:Props) {
  return (
    <div>
      <Header />
      <main>{props.children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
