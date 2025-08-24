import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/10",
        success:
          "border-green-500/50 text-green-700 dark:border-green-500 [&>svg]:text-green-600 bg-green-50 dark:bg-green-950/50",
        warning:
          "border-yellow-500/50 text-yellow-700 dark:border-yellow-500 [&>svg]:text-yellow-600 bg-yellow-50 dark:bg-yellow-950/50",
        info:
          "border-blue-500/50 text-blue-700 dark:border-blue-500 [&>svg]:text-blue-600 bg-blue-50 dark:bg-blue-950/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants> & {
    dismissible?: boolean
    onDismiss?: () => void
  }
>(({ className, variant, dismissible = false, onDismiss, children, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    aria-live="polite"
    aria-atomic="true"
    className={cn(alertVariants({ variant }), dismissible && "pr-12", className)}
    {...props}
  >
    {children}
    {dismissible && (
      <button
        type="button"
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:text-foreground hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
        onClick={onDismiss}
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
