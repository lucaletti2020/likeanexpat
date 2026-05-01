import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";

interface Props extends LucideProps {
  name: string;
  fallback?: string;
}

export function DynamicLucideIcon({ name, fallback = "Circle", ...props }: Props) {
  const iconKey = (name in LucideIcons ? name : fallback) as keyof typeof LucideIcons;
  const Icon = LucideIcons[iconKey] as React.FC<LucideProps>;
  return <Icon {...props} />;
}
