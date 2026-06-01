import { cn } from "@/lib/utils";

type CardVariant = "default" | "interactive" | "ghost";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  as?: React.ElementType;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md",
  interactive:
    "bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 cursor-pointer active:scale-[0.98]",
  ghost: "bg-white/60 rounded-2xl border border-gray-100/80",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  variant = "default",
  padding = "md",
  as: Component = "div",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "transition-all duration-200",
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
