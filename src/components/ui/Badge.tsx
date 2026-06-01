import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  danger: "bg-red-100 text-red-700 border-red-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
  neutral: "bg-gray-100 text-gray-600 border-gray-200",
};

const dotStyles: Record<BadgeVariant, string> = {
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  neutral: "bg-gray-400",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function Badge({
  variant = "neutral",
  size = "sm",
  dot = false,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotStyles[variant])} />}
      {children}
    </span>
  );
}

export function statusToBadgeVariant(status: string): BadgeVariant {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "completed":
    case "active":
    case "available":
      return "success";
    case "pending":
    case "busy":
      return "warning";
    case "cancelled":
    case "critical":
    case "offline":
      return "danger";
    case "inactive":
      return "neutral";
    default:
      return "info";
  }
}
