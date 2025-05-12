import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

export function PasswordStrengthMeter({
  password,
  className,
}: PasswordStrengthMeterProps) {
  // Check for specific password requirements
  const hasLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password)
  
  // Calculate strength based directly on requirements
  const allRequirementsMet = hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar
  
  // If all requirements are met, set to maximum strength (4)
  // Otherwise calculate based on how many requirements are met
  let strength = 0
  if (allRequirementsMet) {
    strength = 4
  } else {
    strength = calculatePasswordStrength(password)
  }
  
  return (
    <div className={cn("mt-2", className)}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-muted-foreground">
          {strength === 0 && "ضعیف"}
          {strength === 1 && "ضعیف"}
          {strength === 2 && "متوسط"}
          {strength === 3 && "قوی"}
          {strength === 4 && "بسیار قوی"}
        </div>
      </div>
      <div className="flex h-1.5 w-full gap-1 rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            strength >= 1 ? "w-1/4 bg-red-500" : "w-0",
            strength >= 2 ? "w-2/4 bg-orange-500" : "",
            strength >= 3 ? "w-3/4 bg-yellow-500" : "",
            strength === 4 ? "w-full bg-green-500" : ""
          )}
        />
      </div>
      
      {/* Password Requirements Checklist */}
      <div className="grid gap-1 mt-2">
        <RequirementItem fulfilled={hasLength}>
          حداقل ۸ کاراکتر
        </RequirementItem>
        <RequirementItem fulfilled={hasUppercase}>
          حداقل یک حرف بزرگ (A-Z)
        </RequirementItem>
        <RequirementItem fulfilled={hasLowercase}>
          حداقل یک حرف کوچک (a-z)
        </RequirementItem>
        <RequirementItem fulfilled={hasNumber}>
          حداقل یک عدد (0-9)
        </RequirementItem>
        <RequirementItem fulfilled={hasSpecialChar}>
          حداقل یک کاراکتر ویژه (!@#$%^&*)
        </RequirementItem>
      </div>
    </div>
  )
}

// Checklist item component
function RequirementItem({
  fulfilled,
  children,
}: {
  fulfilled: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {fulfilled ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <X className="h-3 w-3 text-muted-foreground" />
      )}
      <span className={fulfilled ? "text-foreground" : "text-muted-foreground"}>
        {children}
      </span>
    </div>
  )
}

// Password strength calculation helper function
// This is used when not all requirements are met
export function calculatePasswordStrength(password: string): number {
  if (!password) return 0
  
  let score = 0
  
  // Count fulfilled requirements
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  // Convert count to strength level (0-4)
  if (score === 0) return 0
  if (score === 1) return 1
  if (score === 2) return 2
  if (score === 3) return 2
  if (score === 4) return 3
  
  return 3 // For score of 5 (still not all requirements since that's handled separately)
} 