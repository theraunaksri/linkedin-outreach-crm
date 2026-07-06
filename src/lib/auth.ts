import { cookies } from "next/headers";

export const VIEW_COOKIE = "opika_view";
export const EDIT_COOKIE = "opika_edit";

// Not cryptographically strong — this is a lightweight internal gate, not a
// security boundary against a determined attacker. Good enough to keep the
// dashboard off search engines and out of casual hands.
export function tokenFor(password: string) {
  return btoa(password);
}

export async function isEditUnlocked() {
  const store = await cookies();
  const editPassword = process.env.OPIKA_EDIT_PASSWORD;
  if (!editPassword) return true; // no edit password configured — leave editing open
  return store.get(EDIT_COOKIE)?.value === tokenFor(editPassword);
}

export async function assertEditUnlocked() {
  if (!(await isEditUnlocked())) {
    throw new Error("Editing is locked. Unlock editing from the top bar first.");
  }
}
