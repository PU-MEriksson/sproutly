import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as Badge } from "./Badge.vue";

export const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-calm-600 focus-visible:ring-calm-600/50 focus-visible:ring-[3px] aria-invalid:ring-red-500/20 aria-invalid:border-red-500 transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-calm-500 to-calm-600 text-white [a&]:hover:from-calm-600 [a&]:hover:to-calm-700",
        secondary:
          "border-calm-300 bg-calm-100 text-calm-700 [a&]:hover:bg-calm-200",
        destructive:
          "border-transparent bg-red-500 text-white [a&]:hover:bg-red-500/90 focus-visible:ring-red-500/20",
        outline:
          "border-calm-200 text-calm-700 [a&]:hover:bg-calm-50 [a&]:hover:text-calm-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
export type BadgeVariants = VariantProps<typeof badgeVariants>;
