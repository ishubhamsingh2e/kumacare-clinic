"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const ownerPrivacySchema = z.object({
  showOwnerInfo: z.boolean(),
  ownerFieldsToShow: z
    .object({
      name: z.boolean(),
      email: z.boolean(),
      phone: z.boolean(),
      image: z.boolean(),
    })
    .optional(),
});

type FormValues = z.infer<typeof ownerPrivacySchema>;

interface OwnerPrivacyFormProps {
  clinic: Clinic;
}

export function OwnerPrivacyForm({ clinic }: OwnerPrivacyFormProps) {
  const ownerFieldsToShow = (() => {
    if (!clinic.ownerFieldsToShow) {
      return { name: true, email: false, phone: false, image: true };
    }
    if (typeof clinic.ownerFieldsToShow === "object") {
      return {
        name: (clinic.ownerFieldsToShow as any).name ?? true,
        email: (clinic.ownerFieldsToShow as any).email ?? false,
        phone: (clinic.ownerFieldsToShow as any).phone ?? false,
        image: (clinic.ownerFieldsToShow as any).image ?? true,
      };
    }
    return { name: true, email: false, phone: false, image: true };
  })();

  const form = useForm<FormValues>({
    resolver: zodResolver(ownerPrivacySchema),
    defaultValues: {
      showOwnerInfo: clinic.showOwnerInfo ?? true,
      ownerFieldsToShow,
    },
  });

  const {
    formState: { isSubmitting },
    watch,
    setValue,
  } = form;

  const showOwnerInfo = watch("showOwnerInfo");
  const fieldsToShow = watch("ownerFieldsToShow");

  const onSubmit = async (values: FormValues) => {
    const result = await updateClinicProfile({
      id: clinic.id,
      showOwnerInfo: values.showOwnerInfo,
      ownerFieldsToShow: values.ownerFieldsToShow,
    });
    if (result.success) {
      toast.success("Owner privacy settings updated successfully.");
    } else {
      toast.error(result.error || "Failed to update privacy settings.");
    }
  };

  const handleFieldToggle = (
    field: "name" | "email" | "phone" | "image"
  ) => {
    const currentValue = fieldsToShow?.[field] ?? false;
    setValue(`ownerFieldsToShow.${field}`, !currentValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Owner Information Privacy</CardTitle>
        <CardDescription>
          Control what owner information is displayed publicly on your clinic
          profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Field>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FieldLabel>Show Owner Information</FieldLabel>
                <div className="text-sm text-muted-foreground">
                  Display owner details on your clinic's public profile
                </div>
              </div>
              <Switch
                checked={showOwnerInfo}
                onCheckedChange={(checked) =>
                  setValue("showOwnerInfo", checked)
                }
              />
            </div>
          </Field>

          {showOwnerInfo && (
            <div className="space-y-4 rounded-lg border p-4">
              <div className="text-sm font-medium">
                Select which owner details to show:
              </div>
              <div className="space-y-3">
                {[
                  { field: "name" as const, label: "Owner Name" },
                  { field: "email" as const, label: "Owner Email" },
                  { field: "phone" as const, label: "Owner Phone" },
                  { field: "image" as const, label: "Owner Profile Image" },
                ].map(({ field, label }) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={fieldsToShow?.[field] ?? false}
                      onCheckedChange={() => handleFieldToggle(field)}
                    />
                    <Label htmlFor={field} className="cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Privacy Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
