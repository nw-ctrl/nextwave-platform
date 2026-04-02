"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BentoCardProps = {
  title: string;
  children: React.ReactNode;
  detailContent?: React.ReactNode;
  gridSpan?: string;
  className?: string;
};

export function BentoCard({ title, children, detailContent, gridSpan, className }: BentoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <motion.div layoutId={`card-${title}`} className={cn(gridSpan)}>
        <Card
          role="button"
          tabIndex={0}
          onClick={() => setIsExpanded(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsExpanded(true);
            }
          }}
          className={cn(
            "group relative h-full cursor-pointer overflow-hidden rounded-[2rem] border border-blue-100 bg-white p-6 text-slate-700 shadow-sm transition-shadow hover:shadow-md",
            className
          )}
        >
          <div className="relative z-10 flex items-center justify-between gap-3 pb-4">
            <h3 className="text-sm font-semibold tracking-[0.02em] text-slate-700">{title}</h3>
            <Maximize2 className="h-4 w-4 text-blue-300 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="relative z-10 text-slate-500">{children}</div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/70 via-transparent to-cyan-50/40" />
        </Card>
      </motion.div>

      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              layoutId={`card-${title}`}
              className="relative flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-blue-50 bg-white p-8 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="absolute right-6 top-6 rounded-full bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100"
              >
                <X className="h-6 w-6" />
              </button>

              <h2 className="mb-6 pr-16 text-2xl font-bold text-slate-800">{title} - Detailed View</h2>
              <div className="overflow-y-auto pr-1 text-slate-600">
                {detailContent ?? children}
                <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-6">
                  <p className="text-sm text-blue-800">Professional Medical Insight: Values are displayed from the live MediVault workspace and preserve the current platform logic.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
