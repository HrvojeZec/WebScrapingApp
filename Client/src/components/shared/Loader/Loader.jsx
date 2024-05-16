import React from "react";
import { Loader } from "@mantine/core";
export function LoaderGlobal() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Loader size={30} />
    </div>
  );
}
