import * as React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

type LinkButtonProps = React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

// Base UI's Button enforces native <button> semantics and should not wrap
// links via its `render` prop, so link-styled-as-button cases apply
// buttonVariants() directly to next/link instead.
export function LinkButton({ className, variant, size, ...props }: LinkButtonProps) {
  return <Link className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
