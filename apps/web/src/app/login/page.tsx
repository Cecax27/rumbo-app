import React from "react";
import { connection } from "next/server";
import LoginPage from "./subpage";

export default async function Login() {
  await connection();

  return (
    <LoginPage />
  );
}
