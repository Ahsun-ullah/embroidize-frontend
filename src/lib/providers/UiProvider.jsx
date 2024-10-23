"use client";

import { NextUIProvider } from "@nextui-org/react";

export function UiProvider({ children }) {
  return <NextUIProvider>{children}</NextUIProvider>;
}
