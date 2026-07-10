import React from "react";
import { connection } from "next/server";
import ResetPasswordForm from "./reset-password-form";

export default async function ResetPassword() {
  await connection();

  return <ResetPasswordForm />;
}
