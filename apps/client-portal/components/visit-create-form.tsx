"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const visitSchema = z.object({
  patientId: z.string().min(1),
  subjective: z.string().optional(),
  bp: z.string().optional(),
  temp: z.string().optional(),
  weight: z.string().optional(),
  assessment: z.string().min(2, "Diagnosis is required"),
  plan: z.string().min(2, "Prescription or plan is required"),
  visitDate: z.string().min(1, "Visit date is required"),
  revisitDate: z.string().optional(),
});

type VisitFormValues = z.input<typeof visitSchema>;

type Props = {
  patientId: string;
  patientName: string;
  initialValues?: Partial<VisitFormValues>;
  mode?: "create" | "edit";
  visitId?: string;
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

export function VisitCreateForm({ patientId, patientName, initialValues, mode = "create", visitId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<VisitFormValues, unknown, z.output<typeof visitSchema>>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      patientId,
      subjective: initialValues?.subjective ?? "",
      bp: initialValues?.bp ?? "",
      temp: initialValues?.temp ?? "",
      weight: initialValues?.weight ?? "",
      assessment: initialValues?.assessment ?? "",
      plan: initialValues?.plan ?? "",
      visitDate: initialValues?.visitDate ?? new Date().toISOString().slice(0, 10),
      revisitDate: initialValues?.revisitDate ?? "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const response = await fetch(mode === "edit" && visitId ? `/api/visits/${visitId}` : "/api/visits", {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();
      if (!response.ok) {
        const message = typeof result?.error === "string" ? result.error : "Unable to save visit";
        setServerError(message);
        toast.error(message);
        return;
      }

      toast.success(mode === "edit" ? "Diagnosis updated" : "Visit saved");
      router.push(`/patients/${patientId}`);
      router.refresh();
    });
  });

  return (
    <Card className="rounded-[32px] border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{mode === "edit" ? "Update diagnosis" : "Diagnosis and prescription"}</CardTitle>
        <p className="text-sm text-muted-foreground">{mode === "edit" ? `Updating visit notes for ${patientName}.` : `Recording visit notes for ${patientName}.`}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-6">
          <Controller control={form.control} name="patientId" render={({ field }) => <input type="hidden" {...field} />} />
          <div className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="visitDate">Visit date</Label>
              <Input id="visitDate" type="date" {...form.register("visitDate")} />
              <FieldError message={form.formState.errors.visitDate?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="revisitDate">Revisit date</Label>
              <Input id="revisitDate" type="date" {...form.register("revisitDate")} />
              <FieldError message={form.formState.errors.revisitDate?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bp">BP</Label>
              <Input id="bp" placeholder="120/80" {...form.register("bp")} />
              <FieldError message={form.formState.errors.bp?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="temp">Temperature</Label>
              <Input id="temp" placeholder="36.8C" {...form.register("temp")} />
              <FieldError message={form.formState.errors.temp?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weight">Weight</Label>
              <Input id="weight" placeholder="65 kg" {...form.register("weight")} />
              <FieldError message={form.formState.errors.weight?.message} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subjective">Subjective notes</Label>
            <Textarea id="subjective" rows={5} placeholder="Symptoms, history, and visit context" {...form.register("subjective")} />
            <FieldError message={form.formState.errors.subjective?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="assessment">Diagnosis</Label>
            <Textarea id="assessment" rows={4} placeholder="Assessment or diagnosis" {...form.register("assessment")} />
            <FieldError message={form.formState.errors.assessment?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="plan">Prescription and plan</Label>
            <Textarea id="plan" rows={8} placeholder="Prescription, treatment plan, and review notes" {...form.register("plan")} />
            <FieldError message={form.formState.errors.plan?.message} />
          </div>

          {serverError ? <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{serverError}</div> : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : mode === "edit" ? "Update diagnosis" : "Save visit"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push(`/patients/${patientId}`)}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

