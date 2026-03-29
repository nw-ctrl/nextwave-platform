"use client";

import { useState } from "react";
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="rounded-[32px] border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Professional Details</CardTitle>
          <CardDescription>Public identification and credentials on prescriptions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Display Name</Label>
            <Input 
              id="full_name" 
              name="full_name" 
              value={profile.full_name || ""} 
              onChange={handleChange} 
              placeholder="e.g. Dr. John Doe"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualifications</Label>
              <Input 
                id="qualification" 
                name="qualification" 
                value={profile.qualification || ""} 
                onChange={handleChange} 
                placeholder="e.g. MBBS, FCPS"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pmdc_no">Registration No (PMDC/PMC)</Label>
              <Input 
                id="pmdc_no" 
                name="pmdc_no" 
                value={profile.pmdc_no || ""} 
                onChange={handleChange} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Prescription Layout</CardTitle>
          <CardDescription>Customize the print metadata (parity with Android).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prescription_header">Header Text</Label>
              <Input 
                id="prescription_header" 
                name="prescription_header" 
                value={profile.prescription_header || ""} 
                onChange={handleChange} 
                placeholder="e.g. City Hospital Clinic"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescription_footer">Footer Text</Label>
              <Input 
                id="prescription_footer" 
                name="prescription_footer" 
                value={profile.prescription_footer || ""} 
                onChange={handleChange} 
                placeholder="e.g. Contact: 123-456-7890"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prescription_font_size">Print Font Size</Label>
              <Input 
                id="prescription_font_size" 
                name="prescription_font_size" 
                type="number"
                value={profile.prescription_font_size || 14} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdf_line_offset">PDF Line Offset</Label>
              <Input 
                id="pdf_line_offset" 
                name="pdf_line_offset" 
                type="number"
                value={profile.pdf_line_offset || 0} 
                onChange={handleChange} 
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 pt-4 pb-4">
          <Button type="submit" disabled={loading} className="ml-auto rounded-full">
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
