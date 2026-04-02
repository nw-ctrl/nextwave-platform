"use client";

import { useState } from "react";
import { LoaderCircle, Printer, Upload, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { updateDoctorProfile, uploadDoctorLetterhead } from "./actions";

type DoctorProfileFormState = {
  full_name: string;
  qualification: string;
  pmdc_no: string;
  prescription_header: string;
  prescription_footer: string;
  letterhead_image_path: string;
  letterhead_image_url?: string | null;
  pdf_line_offset: number | string;
  prescription_font_size: number | string;
  pdf_signature_y: number | string;
  pdf_date_x: number | string;
};

function pickString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function pickNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function DoctorProfileForm({
  initialProfile,
  clientId
}: {
  initialProfile: Record<string, unknown> | null;
  clientId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<DoctorProfileFormState>({
    full_name: pickString(initialProfile?.full_name),
    qualification: pickString(initialProfile?.qualification),
    pmdc_no: pickString(initialProfile?.pmdc_no),
    prescription_header: pickString(initialProfile?.prescription_header),
    prescription_footer: pickString(initialProfile?.prescription_footer),
    letterhead_image_path: pickString(initialProfile?.letterhead_image_path),
    letterhead_image_url: pickString(initialProfile?.letterhead_image_url, null as unknown as string) || null,
    pdf_line_offset: pickNumber(initialProfile?.pdf_line_offset, 0),
    prescription_font_size: pickNumber(initialProfile?.prescription_font_size, 14),
    pdf_signature_y: pickNumber(initialProfile?.pdf_signature_y, 0),
    pdf_date_x: pickNumber(initialProfile?.pdf_date_x, 140),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleLetterheadUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.set("file", file);

      const result = await uploadDoctorLetterhead(clientId, formData);
      setProfile((current) => ({
        ...current,
        letterhead_image_path: result.path,
        letterhead_image_url: result.publicUrl,
      }));
      toast.success("Letterhead uploaded and synced.");
    } catch (err: any) {
      toast.error(err.message || "Letterhead upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateDoctorProfile(clientId, profile);
      toast.success("Doctor profile updated successfully.");
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="glass border-none rounded-[32px] overflow-hidden">
        <CardHeader className="pb-8 pt-8 px-8">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-[20px] bg-primary/10 text-primary shadow-inner">
              <UserCog className="size-7" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Professional Profile</CardTitle>
              <CardDescription className="text-sm opacity-70">Identification and academic credentials for official prescriptions.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-10">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                className="h-12 rounded-2xl border-none bg-black/5 dark:bg-white/5 focus-visible:ring-primary focus-visible:bg-white/10 dark:focus-visible:bg-black/10 transition-all font-medium"
                value={profile.full_name || ""}
                onChange={handleChange}
                placeholder="Dr. Mohammad Ali"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pmdc_no" className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">PMDC / PMC Registration</Label>
              <Input
                id="pmdc_no"
                name="pmdc_no"
                className="h-12 rounded-2xl border-none bg-black/5 dark:bg-white/5 focus-visible:ring-primary focus-visible:bg-white/10 dark:focus-visible:bg-black/10 transition-all font-medium"
                value={profile.pmdc_no || ""}
                onChange={handleChange}
                placeholder="12345-P"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="qualification" className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Academic Qualifications</Label>
            <Input
              id="qualification"
              name="qualification"
              className="h-12 rounded-2xl border-none bg-black/5 dark:bg-white/5 focus-visible:ring-primary focus-visible:bg-white/10 dark:focus-visible:bg-black/10 transition-all font-medium"
              value={profile.qualification || ""}
              onChange={handleChange}
              placeholder="MBBS, FCPS (Cardiology), MRCP"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-none rounded-[32px] overflow-hidden">
        <CardHeader className="pb-8 pt-8 px-8">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-[20px] bg-sky-500/10 text-sky-600 shadow-inner">
              <Printer className="size-7" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Prescription Settings</CardTitle>
              <CardDescription className="text-sm opacity-70">Shared with Android prescription generation and web print output.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-10">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prescription_header" className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Header (Contact / Clinic Info)</Label>
              <Textarea
                id="prescription_header"
                name="prescription_header"
                className="min-h-28 rounded-2xl border-none bg-black/5 dark:bg-white/5 focus-visible:ring-primary transition-all font-medium"
                value={profile.prescription_header || ""}
                onChange={handleChange}
                placeholder="Phone: 0300-1234567\nAddress: Jail Road, Lahore"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescription_footer" className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Footer / Signature Area</Label>
              <Textarea
                id="prescription_footer"
                name="prescription_footer"
                className="min-h-28 rounded-2xl border-none bg-black/5 dark:bg-white/5 focus-visible:ring-primary transition-all font-medium"
                value={profile.prescription_footer || ""}
                onChange={handleChange}
                placeholder="Available 9AM - 5PM Mon-Fri"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-border/60 bg-black/5 p-5 dark:bg-white/5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Letterhead image</h3>
                <p className="text-xs text-muted-foreground">
                  Android saves the printable letterhead into the doctor profile. Uploading here keeps the web print view on the same asset.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-border/60 px-4 py-2 text-sm font-medium">
                {uploading ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {uploading ? "Uploading..." : "Upload letterhead"}
                <input type="file" accept="image/*" className="hidden" onChange={handleLetterheadUpload} disabled={uploading} />
              </label>
            </div>

            <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
              <div className="space-y-2">
                <Label htmlFor="letterhead_image_path" className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Stored Letterhead Path</Label>
                <Input
                  id="letterhead_image_path"
                  name="letterhead_image_path"
                  className="h-12 rounded-2xl border-none bg-white/70 dark:bg-black/20 focus-visible:ring-primary transition-all font-medium"
                  value={profile.letterhead_image_path || ""}
                  onChange={handleChange}
                  placeholder="doctor-id/letterhead.png"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Preview</p>
                <div className="flex h-28 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border/60 bg-white/70 dark:bg-black/20">
                  {profile.letterhead_image_url ? (
                    <img src={profile.letterhead_image_url} alt="Letterhead preview" className="h-full w-full object-contain" />
                  ) : (
                    <p className="px-4 text-center text-xs text-muted-foreground">No letterhead synced yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="prescription_font_size" className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Font Size</Label>
              <Input
                id="prescription_font_size"
                name="prescription_font_size"
                type="number"
                className="h-12 rounded-2xl border-none bg-black/5 dark:bg-white/5 focus-visible:ring-primary transition-all font-medium"
                value={profile.prescription_font_size || 14}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdf_line_offset" className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Line Offset (Y)</Label>
              <Input
                id="pdf_line_offset"
                name="pdf_line_offset"
                type="number"
                className="h-12 rounded-2xl border-none bg-black/5 dark:bg-white/5 focus-visible:ring-primary transition-all font-medium"
                value={profile.pdf_line_offset || 0}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdf_signature_y" className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Signature Pos (Y)</Label>
              <Input
                id="pdf_signature_y"
                name="pdf_signature_y"
                type="number"
                className="h-12 rounded-2xl border-none bg-black/5 dark:bg-white/5 focus-visible:ring-primary transition-all font-medium"
                value={profile.pdf_signature_y || 0}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdf_date_x" className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Date Offset (X)</Label>
              <Input
                id="pdf_date_x"
                name="pdf_date_x"
                type="number"
                className="h-12 rounded-2xl border-none bg-black/5 dark:bg-white/5 focus-visible:ring-primary transition-all font-medium"
                value={profile.pdf_date_x || 140}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-white/40 dark:bg-black/20 p-6 flex justify-end">
          <Button type="submit" disabled={loading} className="rounded-2xl h-11 px-8 shadow-md">
            {loading ? "Syncing..." : "Update Professional Profile"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
