"use client";
import { SessionProvider } from "next-auth/react";
import React from "react";

function AuthProviders({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export default AuthProviders;
