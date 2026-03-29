"use client";

import { useState } from "react";
import { UserCog, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { updateDoctorProfile } from "./actions";

export function DoctorProfileForm({ 
  initialProfile, 
  clientId 
}: { 
  initialProfile: any; 
  clientId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(initialProfile || {
    full_name: "",
    qualification: "",
    pmdc_no: "",
    prescription_header: "",
    prescription_footer: "",
    pdf_line_offset: 0,
    prescription_font_size: 14,
    pdf_signature_y: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
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
                    <CardDescription className="text-sm opacity-70">Constants for PDF generation and Android app parity.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-10">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prescription_header" className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Header (Contact/Clinic Info)</Label>
              <Input 
                id="prescription_header" 
                name="prescription_header" 
                className="h-12 rounded-2xl border-none bg-black/5 dark:bg-white/5 focus-visible:ring-primary transition-all font-medium"
                value={profile.prescription_header || ""} 
                onChange={handleChange} 
                placeholder="Phone: 0300-1234567 • Address: Jail Road, LHR"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescription_footer" className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Footer / Signature Area</Label>
              <Input 
                id="prescription_footer" 
                name="prescription_footer" 
                className="h-12 rounded-2xl border-none bg-black/5 dark:bg-white/5 focus-visible:ring-primary transition-all font-medium"
                value={profile.prescription_footer || ""} 
                onChange={handleChange} 
                placeholder="Available 9AM - 5PM Mon-Fri"
              />
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
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
