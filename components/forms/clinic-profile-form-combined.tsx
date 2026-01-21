"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Clinic } from "@prisma/client";
import { updateClinicProfile } from "@/lib/actions/clinic";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Upload, X, Building2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const clinicProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  bio: z.string().optional(),
});

type FormValues = z.infer<typeof clinicProfileSchema>;

interface ClinicProfileFormCombinedProps {
  clinic: Clinic;
}

export function ClinicProfileFormCombined({
  clinic,
}: ClinicProfileFormCombinedProps) {
  const router = useRouter();
  const [coverPreview, setCoverPreview] = useState<string | null>(
    clinic.coverImage,
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(
    clinic.profileImage,
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(clinicProfileSchema),
    defaultValues: {
      name: clinic.name || "",
      email: clinic.email || "",
      bio: clinic.bio || "",
    },
  });

  const {
    formState: { isSubmitting, errors },
  } = form;

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
      setCoverFile(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      setLogoFile(file);
    }
  };

  const handleRemoveCover = () => {
    setCoverPreview(clinic.coverImage);
    setCoverFile(null);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(clinic.profileImage);
    setLogoFile(null);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      let coverImagePath = clinic.coverImage;
      let logoImagePath = clinic.profileImage;

      // Upload cover image if changed
      if (coverFile) {
        const formData = new FormData();
        formData.append("file", coverFile);
        formData.append("type", "cover");
        formData.append("clinicId", clinic.id);

        const response = await fetch("/api/upload/clinic-image", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to upload cover image");
        }

        coverImagePath = result.url;
      }

      // Upload logo if changed
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        formData.append("type", "profile");
        formData.append("clinicId", clinic.id);

        const response = await fetch("/api/upload/clinic-image", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to upload logo image");
        }

        logoImagePath = result.url;
      }

      // Update clinic profile with all data
      const updateResult = await updateClinicProfile({
        id: clinic.id,
        ...values,
        coverImage: coverImagePath,
        profileImage: logoImagePath,
      });

      if (updateResult.success) {
        toast.success("Clinic profile updated successfully.");
        // Reset file states
        setCoverFile(null);
        setLogoFile(null);
        // Refresh to show updated data
        router.refresh();
      } else {
        toast.error(updateResult.error || "Failed to update profile.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinic Profile</CardTitle>
        <CardDescription>
          Update your clinic's public profile information, cover image, and
          logo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Cover Image Section */}
          <div className="space-y-2">
            <label className="sr-only">Cover Image</label>
            <div className="relative aspect-4/1 w-full overflow-hidden rounded-lg border-2 border-dashed">
              {coverPreview ? (
                <>
                  <Image
                    src={coverPreview}
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={handleRemoveCover}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:bg-muted/50">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">Click to upload cover image</span>
                  <span className="text-xs">Recommended: 1920x400px</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Logo and Basic Info Section */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="sr-only">Clinic Logo</label>
              <div className="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-dashed">
                {logoPreview ? (
                  <>
                    <Image
                      src={logoPreview}
                      alt="Logo"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6"
                      onClick={handleRemoveLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:bg-muted/50">
                    <Building2 className="h-6 w-6" />
                    <span className="text-xs text-center px-1">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Clinic Name - Next to Logo */}
            <div className="flex-1 space-y-1">
              <h2 className="text-lg font-semibold">Clinic Logo</h2>
              <p className="text-sm text-muted-foreground">
                This logo will represent your clinic on your profile and in
                communications.
                <br />
                JPG, PNG or WebP. 50kb max.
              </p>
            </div>
          </div>

          {/* Rest of the Form */}
          <Field>
            <FieldLabel>Clinic Name *</FieldLabel>
            <FieldContent>
              <Input {...form.register("name")} />
            </FieldContent>
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Contact Email</FieldLabel>
            <FieldContent>
              <Input type="email" {...form.register("email")} />
            </FieldContent>
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Bio</FieldLabel>
            <FieldContent>
              <Textarea
                {...form.register("bio")}
                placeholder="Tell patients about your clinic..."
                rows={4}
              />
            </FieldContent>
            {errors.bio && <FieldError>{errors.bio.message}</FieldError>}
          </Field>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
