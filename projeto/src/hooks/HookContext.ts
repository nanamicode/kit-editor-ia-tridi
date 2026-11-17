import React from "react";

/** Variante de gancho (0–3 s) aplicada sobre o corpo validado do V01. null = V01 original. */
export type HookId = "h1" | "h2" | "h3" | "h4";

export const HookContext = React.createContext<HookId | null>(null);
