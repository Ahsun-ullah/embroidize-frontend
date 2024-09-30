"use server";

import { signIn } from "../../auth";

export async function googleLogin(formData) {
  const action = formData.get("action");
  console.log(action);
  if (action) {
    await signIn(action, { redirectTo: "/" });
  }
}
