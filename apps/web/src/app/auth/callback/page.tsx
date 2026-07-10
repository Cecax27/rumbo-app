import React from "react";
import { connection } from "next/server";
import CallbackForm from "./callback-form";

export default async function AuthCallback() {
  await connection();

  return <CallbackForm />;
}
