import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: "online" | "offline" | "busy";
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; image: number; text: string }> = {
  xs: { container: "h-7 w-7", image: 28, text: "text-xs" },
  sm: { container: "h-9 w-9", image: 36, text: "text-sm" },
  md: { container: "h-12 w-12", image: 48, text: "text-base" },
  lg: { container: "h-16 w-16", image: 64, text: "text-lg" },
  xl: { container: "h-20 w-20", image: 80, text: "text-xl" },
};

const statusStyles = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  busy: "bg-yellow-500",
};

export function Avatar({ src, alt, name, size = "md", status, className }: AvatarProps) {
  const { container, image, text } = sizeStyles[size];
  const initials = name ? getInitials(name) : "?";

  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center",
          "bg-gradient-to-br from-blue-100 to-blue-200",
          container
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt ?? name ?? "Avatar"}
            width={image}
            height={image}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={cn("font-semibold text-blue-700 select-none", text)}>{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-white",
            statusStyles[status],
            size === "xs" || size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"
          )}
        />
      )}
    </div>
  );
}
