// import * as React from "react"
// import { Slot } from "@radix-ui/react-slot"
// import { cva } from "class-variance-authority";

// import { cn } from "@/lib/utils"

// const buttonVariants = cva(
//   "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
//   {
//     variants: {
//       variant: {
//         default: "bg-primary text-primary-foreground hover:bg-primary/90",
//         destructive:
//           "bg-destructive text-destructive-foreground hover:bg-destructive/90",
//         outline:
//           "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
//         secondary:
//           "bg-secondary text-secondary-foreground hover:bg-secondary/80",
//         ghost: "hover:bg-accent hover:text-accent-foreground",
//         link: "text-primary underline-offset-4 hover:underline",
//       },
//       size: {
//         default: "h-10 px-4 py-2",
//         sm: "h-9 rounded-md px-3",
//         lg: "h-11 rounded-md px-8",
//         icon: "h-10 w-10",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//       size: "default",
//     },
//   }
// )

// const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
//   const Comp = asChild ? Slot : "button"
//   return (
//     <Comp
//       className={cn(buttonVariants({ variant, size, className }))}
//       ref={ref}
//       {...props} />
//   );
// })
// Button.displayName = "Button"

// export { Button, buttonVariants }



import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        // Primary - Modern blue
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
        
        // Secondary - Gray
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md shadow-secondary/10 hover:shadow-lg",
        
        // Destructive - Red
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30",
        
        // Outline - Bordered
        outline: "border-2 border-input bg-transparent hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20",
        
        // Ghost - Transparent
        ghost: "hover:bg-accent hover:text-accent-foreground",
        
        // Link - Text only
        link: "text-primary underline-offset-4 hover:underline",
        
        // Emerald - Green (for success/scan)
        emerald: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30",
        
        // Black - Dark mode
        black: "bg-black text-white hover:bg-black/90 shadow-lg shadow-black/20 hover:shadow-xl",
        
        // Success - Green
        success: "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30",
        
        // Warning - Amber
        warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30",
        
        // Info - Sky blue
        info: "bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30",
        
        // Gradient - Premium
        gradient: "bg-gradient-to-r from-primary to-primary/70 text-white hover:from-primary/90 hover:to-primary/60 shadow-lg shadow-primary/20 hover:shadow-xl",
        
        // Outline Primary - Primary bordered
        outlinePrimary: "border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200",
        
        // Outline Emerald - Emerald bordered
        outlineEmerald: "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-200",
        
        // Outline Black - Black bordered
        outlineBlack: "border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-200",
      },
      size: {
        default: "h-10 px-5 py-2 text-sm",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        xl: "h-14 rounded-md px-10 text-lg",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8",
        iconLg: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }