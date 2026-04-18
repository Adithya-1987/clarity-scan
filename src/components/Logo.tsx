import { Brain } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

const textSizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="gradient-hero rounded-xl p-1.5">
        <Brain className={`${sizeMap[size]} text-primary-foreground`} />
      </div>
      {showText && (
        <span className={`font-heading font-bold ${textSizeMap[size]}`}>
          <span className="text-gradient">Neuro</span>
          <span className="text-foreground">Scan</span>
        </span>
      )}
    </div>
  );
}
