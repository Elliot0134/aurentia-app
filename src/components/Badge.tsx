
import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  color?: "yellow" | "blue" | "green" | "violet" | "rose" | "mint" | "blue-violet";
}

const Badge = ({ label, color = "blue" }: BadgeProps) => {
  const colorClasses = {
    yellow: "bg-aurentia-yellow/10 text-aurentia-yellow border-aurentia-yellow/20",
    blue: "bg-aurentia-blue/10 text-aurentia-blue border-aurentia-blue/20",
    green: "bg-aurentia-green/10 text-aurentia-green border-aurentia-green/20",
    violet: "bg-aurentia-violet/10 text-aurentia-violet border-aurentia-violet/20",
    rose: "bg-aurentia-rose/10 text-aurentia-rose border-aurentia-rose/20",
    mint: "bg-aurentia-mint/10 text-aurentia-mint border-aurentia-mint/20",
    "blue-violet": "bg-aurentia-blue-violet/10 text-aurentia-blue-violet border-aurentia-blue-violet/20",
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
        colorClasses[color]
      )}
    >
      {label}
    </div>
  );
};

export default Badge;
