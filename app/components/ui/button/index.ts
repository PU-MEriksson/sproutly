import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-calm-600 focus-visible:ring-calm-600/50 focus-visible:ring-[3px] aria-invalid:ring-red-500/20 aria-invalid:border-red-500 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-calm-500 to-calm-600 text-white shadow-sm hover:from-calm-600 hover:to-calm-700 active:shadow-none",
        destructive:
          "bg-red-500 text-white shadow-xs hover:bg-red-500/90 active:shadow-none focus-visible:ring-red-500/20",
        outline:
          "border border-calm-200 bg-white shadow-xs hover:bg-calm-50 hover:text-calm-900 active:shadow-none",
        secondary:
          "bg-calm-100 text-calm-900 shadow-xs hover:bg-calm-200 active:shadow-none",
        ghost:
          "hover:bg-calm-100 hover:text-calm-900 active:bg-calm-200 text-calm-700",
        link: "text-calm-700 underline-offset-4 hover:underline active:opacity-80",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
