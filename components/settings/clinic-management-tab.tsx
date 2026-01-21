"use client";

import { Clinic, ClinicLocation, ClinicSettings } from "@prisma/client";
import { ClinicProfileFormCombined } from "../forms/clinic-profile-form-combined";
import { LocationManagement } from "../location-management";
import { SocialMediaLinksForm } from "../forms/social-media-links-form";
import { OwnerPrivacyForm } from "../forms/owner-privacy-form";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  WARNING_STYLE,
} from "@/components/ui/alert";
import { MapPin } from "lucide-react";

interface ClinicManagementTabProps {
  clinic: Clinic & { ClinicLocation: ClinicLocation[] };
  settings: ClinicSettings | null;
}

export function ClinicManagementTab({
  clinic,
  settings,
}: ClinicManagementTabProps) {
  return (
    <div className="space-y-6">
      {clinic.ClinicLocation.length === 0 && (
        <Alert className={WARNING_STYLE}>
          <MapPin />
          <AlertTitle>Please add a location</AlertTitle>
          <AlertDescription>
            Your clinic needs at least one location. Please add a location below
            to complete your profile.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Content Column - Left Side (2/3 width) */}
        <div className="space-y-6 md:col-span-2">
          <ClinicProfileFormCombined clinic={clinic} />

          <LocationManagement locations={clinic.ClinicLocation} />
        </div>

        {/* Sidebar Column - Right Side (1/3 width) */}
        <div className="space-y-6">
          <SocialMediaLinksForm clinic={clinic} />

          <OwnerPrivacyForm clinic={clinic} />
        </div>
      </div>
    </div>
  );
}
