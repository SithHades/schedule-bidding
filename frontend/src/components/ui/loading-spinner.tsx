import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8", 
  lg: "h-12 w-12"
}

export default function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-b-2 border-gray-900",
        sizeClasses[size],
        className
      )}
    />
  )
}

export function LoadingButton({ 
  children, 
  loading, 
  disabled, 
  className,
  ...props 
}: {
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  className?: string
  [key: string]: any
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        className
      )}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  )
} 