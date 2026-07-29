"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { type LoginState, login } from "./actions";

const initialState: LoginState = { error: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 w-full max-w-sm rounded-lg border border-border p-6"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Enter the passcode to view chat history.
        </p>
      </div>

      <input
        type="password"
        name="passcode"
        autoComplete="current-password"
        // biome-ignore lint/a11y/noAutofocus: single-field page, focus is expected
        autoFocus
        required
        aria-label="Passcode"
        aria-invalid={state.error ? true : undefined}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
      />

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Checking…" : "Enter"}
      </Button>
    </form>
  );
}
