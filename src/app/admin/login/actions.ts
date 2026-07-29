"use server";

import { redirect } from "next/navigation";
import {
  endAdminSession,
  isPasscodeConfigured,
  startAdminSession,
  verifyPasscode,
} from "@/lib/admin-auth";

export type LoginState = { error: string };

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isPasscodeConfigured()) {
    return { error: "Admin passcode is not set on the server." };
  }

  const passcode = formData.get("passcode");
  if (typeof passcode !== "string" || !verifyPasscode(passcode)) {
    return { error: "Incorrect passcode." };
  }

  await startAdminSession(passcode);
  redirect("/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/login");
}
