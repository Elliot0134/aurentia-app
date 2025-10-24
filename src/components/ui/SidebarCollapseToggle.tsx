import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarCollapseToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export const SidebarCollapseToggle = ({
  isCollapsed,
  onToggle,
  className,
}: SidebarCollapseToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "absolute right-[-12px] top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-100 transition-all duration-300 z-10",
        className
      )}
      aria-label={isCollapsed ? "Déplier le menu" : "Replier le menu"}
    >
      <ChevronLeft
        size={16}
        className={cn(
          "transition-transform duration-300",
          isCollapsed ? "rotate-180" : ""
        )}
      />
    </button>
  );
};
