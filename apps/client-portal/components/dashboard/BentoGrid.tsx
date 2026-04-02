import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type BentoGridProps = {
  children: React.ReactNode;
  className?: string;
};

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <motion.div layout className={cn("grid gap-5 md:grid-cols-2 xl:grid-cols-4", className)}>
      {children}
    </motion.div>
  );
}
