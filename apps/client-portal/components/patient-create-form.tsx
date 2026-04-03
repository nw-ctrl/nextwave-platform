"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const patientSchema = z.object({
  fullName: z.string().min(2, "Patient name is required"),
  phoneNumber: z.string().optional(),
  sex: z.string().min(1, "Select sex"),
  age: z.coerce.number().int().min(0, "Age is required"),
  ageMonths: z.coerce.number().int().min(0).max(11).default(0),
  cnic: z.string().optional(),
  patientCode: z.string().optional(),
  digitalConsentGranted: z.boolean().default(false),
});

type PatientFormValues = z.input<typeof patientSchema>;
type PatientFormOutput = z.output<typeof patientSchema>;

type Props = {
  mode?: "create" | "edit";
  patientId?: string;
  initialValues?: Partial<PatientFormOutput>;
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

export function PatientCreateForm({ mode = "create", patientId, initialValues }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<PatientFormValues, unknown, z.output<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: initialValues?.fullName ?? "",
      phoneNumber: initialValues?.phoneNumber ?? "",
      sex: initialValues?.sex ?? "female",
      age: initialValues?.age ?? 0,
      ageMonths: initialValues?.ageMonths ?? 0,
      cnic: initialValues?.cnic ?? "",
      patientCode: initialValues?.patientCode ?? "",
      digitalConsentGranted: initialValues?.digitalConsentGranted ?? false,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const response = await fetch(mode === "edit" && patientId ? `/api/patients/${patientId}` : "/api/patients", {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();
      if (!response.ok) {
        const message = typeof result?.error === "string" ? result.error : "Unable to save patient";
        setServerError(message);
        toast.error(message);
        return;
      }

      toast.success(mode === "edit" ? "Patient record updated" : "Patient record created");
      router.push(`/patients/${result.patient.id}`);
      router.refresh();
    });
  });

  return (
    <Card className="rounded-[32px] border border-slate-200 bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">{mode === "edit" ? "Update patient" : "Patient registration"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" placeholder="Patient full name" {...form.register("fullName")} />
              <FieldError message={form.formState.errors.fullName?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input id="phoneNumber" placeholder="Optional" {...form.register("phoneNumber")} />
              <FieldError message={form.formState.errors.phoneNumber?.message} />
            </div>
            <div className="grid gap-2">
              <Label>Sex</Label>
              <Controller
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={form.formState.errors.sex?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="age">Age in years</Label>
              <Input id="age" type="number" min="0" {...form.register("age", { valueAsNumber: true })} />
              <FieldError message={form.formState.errors.age?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ageMonths">Age in months</Label>
              <Input id="ageMonths" type="number" min="0" max="11" {...form.register("ageMonths", { valueAsNumber: true })} />
              <FieldError message={form.formState.errors.ageMonths?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cnic">National ID</Label>
              <Input id="cnic" placeholder="Optional" {...form.register("cnic")} />
              <FieldError message={form.formState.errors.cnic?.message} />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="patientCode">Patient code</Label>
              <Input id="patientCode" placeholder="Leave blank to generate automatically" {...form.register("patientCode")} />
              <FieldError message={form.formState.errors.patientCode?.message} />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3">
            <Controller
              control={form.control}
              name="digitalConsentGranted"
              render={({ field }) => <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />}
            />
            <Label className="text-sm font-medium">Digital consent recorded</Label>
          </div>

          {serverError ? <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{serverError}</div> : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : mode === "edit" ? "Update patient" : "Create patient"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push(mode === "edit" && patientId ? `/patients/${patientId}` : "/patients")}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

