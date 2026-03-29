"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintVisitActions() {
  return (
    <Button onClick={() => window.print()} className="gap-2">
      <Printer className="size-4" />
      Print prescription
    </Button>
  );
}

