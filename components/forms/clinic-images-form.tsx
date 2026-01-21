"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Clinic } from "@prisma/client";
import { toast } from "sonner";
import Image from "next/image";

interface ClinicImagesFormProps {
  clinic: Clinic;
}

export function ClinicImagesForm({ clinic }: ClinicImagesFormProps) {
  const [coverImage, setCoverImage] = useState<string | null>(
    clinic.coverImage,
  );
  const [profileImage, setProfileImage] = useState<string | null>(
    clinic.profileImage,
  );
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file: File, type: "cover" | "profile") => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("clinicId", clinic.id);

    try {
      const response = await fetch("/api/upload/clinic-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        if (type === "cover") {
          setCoverImage(result.url);
        } else {
          setProfileImage(result.url);
        }
        toast.success(
          `${type === "cover" ? "Cover" : "Logo"} image uploaded successfully`,
        );
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (type: "cover" | "profile") => {
    if (type === "cover") {
      setCoverImage(null);
    } else {
      setProfileImage(null);
    }
    toast.info(`${type === "cover" ? "Cover" : "Logo"} image removed`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinic Images</CardTitle>
        <CardDescription>
          Upload a cover image and logo for your clinic profile. Images should
          be less than 5MB.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cover Image */}
        <div className="space-y-2">
          <label className="sr-only">Cover Image</label>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed">
            {coverImage ? (
              <>
                <Image
                  src={coverImage}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => handleRemoveImage("cover")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50">
                <Upload className="h-8 w-8" />
                <span className="text-sm">Click to upload cover image</span>
                <span className="text-xs">Recommended: 1920x400px</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "cover");
                  }}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* Profile Image / Logo */}
        <div className="space-y-2">
          <label className="sr-only">Clinic Logo</label>
          <div className="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-dashed">
            {profileImage ? (
              <>
                <Image
                  src={profileImage}
                  alt="Logo"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-1 top-1"
                  onClick={() => handleRemoveImage("profile")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted/50">
                <ImageIcon className="h-6 w-6" />
                <span className="text-xs text-center px-2">Upload logo</span>
                <span className="text-[10px]">Square format</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "profile");
                  }}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        {uploading && (
          <div className="text-sm text-muted-foreground">Uploading...</div>
        )}
      </CardContent>
    </Card>
  );
}
