"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2, Upload, Save, Eye } from "lucide-react";
import { A4PreviewComponent } from "./a4-preview";

interface Clinic {
  id: string;
  name: string;
}

interface PrintSettings {
  id?: string;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  templateType: string;
  useCustomHeader: boolean;
  useCustomFooter: boolean;
  headerImageUrl: string | null;
  footerImageUrl: string | null;
  headerFirstPageOnly: boolean;
  enableWatermark: boolean;
  watermarkImageUrl: string | null;
  watermarkText: string | null;
  watermarkOpacity: number;
  doctorSignatureUrl: string | null;
  patientInfoFields: string[];
  doctorInfoFields: string[];
  useGenericName: boolean;
}

interface PrintSettingsComponentProps {
  clinics: Clinic[];
}

const DEFAULT_SETTINGS: PrintSettings = {
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 15,
  marginRight: 15,
  templateType: "classic",
  useCustomHeader: false,
  useCustomFooter: false,
  headerImageUrl: null,
  footerImageUrl: null,
  headerFirstPageOnly: false,
  enableWatermark: false,
  watermarkImageUrl: null,
  watermarkText: null,
  watermarkOpacity: 0.1,
  doctorSignatureUrl: null,
  patientInfoFields: ["name", "age", "gender", "phone", "address"],
  doctorInfoFields: ["name", "title", "licenseNumber", "phone"],
  useGenericName: false,
};

const PATIENT_INFO_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "age", label: "Age" },
  { value: "gender", label: "Gender" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "address", label: "Address" },
  { value: "bloodGroup", label: "Blood Group" },
];

const DOCTOR_INFO_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "title", label: "Qualification" },
  { value: "licenseNumber", label: "License" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
];

export function PrintSettingsComponent({ clinics }: PrintSettingsComponentProps) {
  const [selectedClinic, setSelectedClinic] = useState<string>(clinics[0]?.id || "");
  const [settings, setSettings] = useState<PrintSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    if (selectedClinic) {
      fetchSettings();
    }
  }, [selectedClinic]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/print-settings?clinicId=${selectedClinic}`);
      const data = await response.json();

      if (data.settings) {
        setSettings(data.settings);
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to fetch print settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/print-settings/templates");
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/print-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId: selectedClinic,
          ...settings,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      toast.success("Print settings saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File, type: string) => {
    try {
      setUploading(type);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload/print-settings", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      const fieldMap: Record<string, keyof PrintSettings> = {
        header: "headerImageUrl",
        footer: "footerImageUrl",
        signature: "doctorSignatureUrl",
        watermark: "watermarkImageUrl",
      };

      setSettings((prev) => ({
        ...prev,
        [fieldMap[type]]: data.url,
      }));

      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(null);
    }
  };

  const handleCopyFromClinic = async (sourceClinicId: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/print-settings/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceClinicId,
          targetClinicId: selectedClinic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to copy settings");
      }

      setSettings(data.settings);
      toast.success("Settings copied successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to copy settings");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSettings((prev) => ({
        ...prev,
        ...template.config,
      }));
      toast.success(`${template.name} template applied`);
    }
  };

  const handlePrintPreview = () => {
    // Generate print-optimized HTML
    const printHTML = generatePrintHTML();
    
    // Open print window
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(printHTML);
      printWindow.document.close();
      
      // Wait for images to load before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    } else {
      toast.error("Please allow pop-ups to print preview");
    }
  };

  const generatePrintHTML = () => {
    // Sample data for preview
    const samplePatient = {
      name: "John Doe",
      age: "35 years",
      gender: "Male",
      phone: "+91 98765 43210",
      email: "john.doe@example.com",
      address: "123 Main Street, Mumbai",
      bloodGroup: "O+",
    };

    const sampleDoctor = {
      name: "Dr. Sarah Smith",
      title: "MBBS, MD (Medicine)",
      licenseNumber: "MH12345",
      phone: "+91 12345 67890",
      email: "dr.sarah@clinic.com",
    };

    const sampleMedicines = [
      {
        name: "Paracetamol",
        genericName: "Acetaminophen",
        dosage: "500mg",
        frequency: "3 times/day",
        duration: "5 days",
        qty: "15",
      },
      {
        name: "Amoxicillin",
        genericName: "Amoxicillin",
        dosage: "250mg",
        frequency: "2 times/day",
        duration: "7 days",
        qty: "14",
      },
      {
        name: "Cetirizine",
        genericName: "Cetirizine HCl",
        dosage: "10mg",
        frequency: "1 time/day",
        duration: "10 days",
        qty: "10",
      },
    ];

    // Template-specific styles
    const getHeaderStyle = () => {
      switch (settings.templateType) {
        case "classic":
          return "border-bottom: 2px solid black; padding-bottom: 8px;";
        case "modern":
          return "border-bottom: 4px solid black; padding-bottom: 12px;";
        case "minimal":
          return "border-bottom: 1px solid #9CA3AF; padding-bottom: 4px;";
        case "professional":
          return "border-bottom: 2px double black; padding-bottom: 12px;";
        case "medical":
          return "background-color: #F3F4F6; border: 2px solid black; padding: 12px; margin-bottom: 12px;";
        default:
          return "border-bottom: 2px solid black; padding-bottom: 8px;";
      }
    };

    const getSectionStyle = () => {
      switch (settings.templateType) {
        case "classic":
          return "border: 1px solid #D1D5DB; padding: 8px; margin-bottom: 8px;";
        case "modern":
          return "border-left: 4px solid black; padding-left: 12px; padding-top: 4px; padding-bottom: 4px; margin-bottom: 8px;";
        case "minimal":
          return "margin-bottom: 8px;";
        case "professional":
          return "border: 1px solid #9CA3AF; border-radius: 4px; padding: 8px; margin-bottom: 8px;";
        case "medical":
          return "background-color: #F9FAFB; border: 1px solid #D1D5DB; padding: 8px; margin-bottom: 8px;";
        default:
          return "border: 1px solid #D1D5DB; padding: 8px; margin-bottom: 8px;";
      }
    };

    // Build patient info HTML
    const patientInfoHTML = settings.patientInfoFields
      .map((field) => {
        const value = samplePatient[field as keyof typeof samplePatient];
        if (!value) return "";
        const labels: Record<string, string> = {
          name: "Name",
          age: "Age",
          gender: "Gender",
          phone: "Phone",
          email: "Email",
          address: "Address",
          bloodGroup: "Blood Group",
        };
        const isFullWidth = field === "address" || field === "email";
        return `<div style="${isFullWidth ? 'grid-column: span 2;' : ''}"><span style="font-weight: 500;">${labels[field]}:</span> ${value}</div>`;
      })
      .filter(Boolean)
      .join("");

    // Build doctor info HTML
    const doctorInfoHTML = settings.doctorInfoFields
      .map((field) => {
        const value = sampleDoctor[field as keyof typeof sampleDoctor];
        if (!value) return "";
        const labels: Record<string, string> = {
          name: "Name",
          title: "Qualification",
          licenseNumber: "License",
          phone: "Phone",
          email: "Email",
        };
        const isFullWidth = field === "email";
        return `<div style="${isFullWidth ? 'grid-column: span 2;' : ''}"><span style="font-weight: 500;">${labels[field]}:</span> ${value}</div>`;
      })
      .filter(Boolean)
      .join("");

    // Build medicine rows
    const medicineRows = sampleMedicines
      .map(
        (med, index) => `
      <tr style="background-color: ${index % 2 === 0 ? "#FFFFFF" : "#F9FAFB"};">
        <td style="border: 1px solid #9CA3AF; padding: 6px 8px;">${index + 1}</td>
        <td style="border: 1px solid #9CA3AF; padding: 6px 8px;">
          <div style="font-weight: 500;">${med.name}</div>
          ${settings.useGenericName && med.genericName ? `<div style="color: #6B7280; font-size: 11px;">(${med.genericName})</div>` : ""}
        </td>
        <td style="border: 1px solid #9CA3AF; padding: 6px 8px;">${med.dosage}</td>
        <td style="border: 1px solid #9CA3AF; padding: 6px 8px;">${med.frequency}</td>
        <td style="border: 1px solid #9CA3AF; padding: 6px 8px;">${med.duration}</td>
        <td style="border: 1px solid #9CA3AF; padding: 6px 8px; text-align: center;">${med.qty}</td>
      </tr>
    `
      )
      .join("");

    // Watermark HTML
    const watermarkHTML = settings.enableWatermark
      ? `<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; opacity: ${settings.watermarkOpacity}; z-index: 1;">
          ${
            settings.watermarkImageUrl
              ? `<img src="${settings.watermarkImageUrl}" alt="Watermark" style="max-width: 50%; max-height: 50%; object-fit: contain;" />`
              : `<div style="font-size: 64px; font-weight: bold; color: #9CA3AF; transform: rotate(-45deg);">${settings.watermarkText || "CONFIDENTIAL"}</div>`
          }
        </div>`
      : "";

    // Header HTML
    const headerHTML =
      settings.useCustomHeader && settings.headerImageUrl
        ? `<div style="margin-bottom: 16px;"><img src="${settings.headerImageUrl}" alt="Header" style="width: 100%; object-fit: contain; max-height: 80px;" /></div>`
        : `<div style="margin-bottom: 12px; ${getHeaderStyle()}">
            <div style="text-align: ${settings.templateType === "minimal" ? "left" : "center"};">
              <h1 style="font-weight: bold; color: #111827; font-size: ${settings.templateType === "minimal" ? "18px" : "20px"}; margin: 0;">CLINIC NAME</h1>
              ${
                settings.templateType !== "minimal"
                  ? `<p style="font-size: 12px; color: #374151; margin: 2px 0;">${sampleDoctor.name} • ${sampleDoctor.title}</p>
                     <p style="font-size: 12px; color: #6B7280; margin: 2px 0;">${sampleDoctor.licenseNumber} • ${sampleDoctor.phone}</p>`
                  : ""
              }
            </div>
          </div>`;

    // Footer HTML
    const footerHTML =
      settings.useCustomFooter && settings.footerImageUrl
        ? `<div style="margin-top: 16px; padding-top: 8px; border-top: 1px solid black;"><img src="${settings.footerImageUrl}" alt="Footer" style="width: 100%; object-fit: contain; max-height: 48px;" /></div>`
        : `<div style="margin-top: 16px; padding-top: 8px; border-top: 1px solid #D1D5DB; text-align: center; font-size: 12px; color: #6B7280;"><p style="margin: 0;">This is a computer-generated prescription</p></div>`;

    // Signature HTML
    const signatureHTML = settings.doctorSignatureUrl
      ? `<div style="display: flex; justify-content: flex-end; margin-top: 16px;">
          <div style="text-align: center;">
            <img src="${settings.doctorSignatureUrl}" alt="Signature" style="height: 48px; object-fit: contain; margin-bottom: 4px;" />
            <div style="border-top: 1px solid black; padding-top: 2px;">
              <p style="font-size: 12px; font-weight: 500; margin: 0;">${sampleDoctor.name}</p>
              <p style="font-size: 12px; color: #6B7280; margin: 0;">${sampleDoctor.licenseNumber}</p>
            </div>
          </div>
        </div>`
      : "";

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Prescription Preview</title>
  <style>
    @page {
      size: A4;
      margin: ${settings.marginTop}mm ${settings.marginRight}mm ${settings.marginBottom}mm ${settings.marginLeft}mm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 13px;
      line-height: 1.4;
      color: #000;
      background: white;
      margin: 0;
      padding: 0;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div style="position: relative; min-height: 100%;">
    ${watermarkHTML}
    
    <div style="position: relative; z-index: 2;">
      ${headerHTML}
      
      <div style="margin-top: 8px; font-size: 13px;">
        ${
          patientInfoHTML
            ? `<div style="${getSectionStyle()}">
                <h2 style="font-size: 12px; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase;">Patient Information</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px;">
                  ${patientInfoHTML}
                </div>
              </div>`
            : ""
        }
        
        ${
          doctorInfoHTML
            ? `<div style="${getSectionStyle()}">
                <h2 style="font-size: 12px; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase;">Doctor Information</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px;">
                  ${doctorInfoHTML}
                </div>
              </div>`
            : ""
        }
        
        <div style="${getSectionStyle()}">
          <h2 style="font-size: 14px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">℞ Prescription</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background-color: #F3F4F6;">
                <th style="border: 1px solid #9CA3AF; padding: 4px 8px; text-align: left; width: 32px;">#</th>
                <th style="border: 1px solid #9CA3AF; padding: 4px 8px; text-align: left;">Medicine ${settings.useGenericName ? "(Generic)" : ""}</th>
                <th style="border: 1px solid #9CA3AF; padding: 4px 8px; text-align: left;">Dosage</th>
                <th style="border: 1px solid #9CA3AF; padding: 4px 8px; text-align: left;">Frequency</th>
                <th style="border: 1px solid #9CA3AF; padding: 4px 8px; text-align: left;">Duration</th>
                <th style="border: 1px solid #9CA3AF; padding: 4px 8px; text-align: left; width: 48px;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${medicineRows}
            </tbody>
          </table>
        </div>
        
        ${signatureHTML}
      </div>
      
      ${footerHTML}
    </div>
  </div>
</body>
</html>
    `.trim();
  };

  if (loading && !settings.templateType) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Settings Panel - Left Side (40%) */}
      <div className="lg:col-span-2 space-y-4">
        {/* Clinic and Template Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Clinic</Label>
              <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Template</Label>
              <Select value={settings.templateType} onValueChange={handleApplyTemplate}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {clinics.length > 1 && (
              <div className="space-y-1.5">
                <Label className="text-sm">Copy From</Label>
                <Select onValueChange={handleCopyFromClinic}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select source clinic" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics
                      .filter((c) => c.id !== selectedClinic)
                      .map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                          {clinic.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Margins */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Margins (mm)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Top: {settings.marginTop}</Label>
                <Slider
                  value={[settings.marginTop]}
                  onValueChange={([value]) => setSettings({ ...settings, marginTop: value })}
                  min={0}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Bottom: {settings.marginBottom}</Label>
                <Slider
                  value={[settings.marginBottom]}
                  onValueChange={([value]) => setSettings({ ...settings, marginBottom: value })}
                  min={0}
                  max={50}
                  step={1}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Left: {settings.marginLeft}</Label>
                <Slider
                  value={[settings.marginLeft]}
                  onValueChange={([value]) => setSettings({ ...settings, marginLeft: value })}
                  min={0}
                  max={50}
                  step={1}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Right: {settings.marginRight}</Label>
                <Slider
                  value={[settings.marginRight]}
                  onValueChange={([value]) => setSettings({ ...settings, marginRight: value })}
                  min={0}
                  max={50}
                  step={1}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header & Footer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Header & Footer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useCustomHeader"
                checked={settings.useCustomHeader}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, useCustomHeader: checked as boolean })
                }
              />
              <Label htmlFor="useCustomHeader" className="text-sm">Custom Header</Label>
            </div>
            {settings.useCustomHeader && (
              <div className="space-y-1.5 pl-6">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "header");
                  }}
                  disabled={uploading === "header"}
                  className="h-8 text-xs"
                />
                {settings.headerImageUrl && (
                  <img src={settings.headerImageUrl} alt="Header" className="h-12 object-contain border rounded" />
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="useCustomFooter"
                checked={settings.useCustomFooter}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, useCustomFooter: checked as boolean })
                }
              />
              <Label htmlFor="useCustomFooter" className="text-sm">Custom Footer</Label>
            </div>
            {settings.useCustomFooter && (
              <div className="space-y-1.5 pl-6">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "footer");
                  }}
                  disabled={uploading === "footer"}
                  className="h-8 text-xs"
                />
                {settings.footerImageUrl && (
                  <img src={settings.footerImageUrl} alt="Footer" className="h-12 object-contain border rounded" />
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="headerFirstPageOnly"
                checked={settings.headerFirstPageOnly}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, headerFirstPageOnly: checked as boolean })
                }
              />
              <Label htmlFor="headerFirstPageOnly" className="text-sm">Header First Page Only</Label>
            </div>
          </CardContent>
        </Card>

        {/* Watermark */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Watermark</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableWatermark"
                checked={settings.enableWatermark}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableWatermark: checked as boolean })
                }
              />
              <Label htmlFor="enableWatermark" className="text-sm">Enable Watermark</Label>
            </div>
            {settings.enableWatermark && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-sm">Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "watermark");
                    }}
                    disabled={uploading === "watermark"}
                    className="h-8 text-xs"
                  />
                  {settings.watermarkImageUrl && (
                    <img src={settings.watermarkImageUrl} alt="Watermark" className="h-12 object-contain border rounded" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Text (optional)</Label>
                  <Input
                    value={settings.watermarkText || ""}
                    onChange={(e) => setSettings({ ...settings, watermarkText: e.target.value })}
                    placeholder="Watermark text"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Opacity: {Math.round(settings.watermarkOpacity * 100)}%</Label>
                  <Slider
                    value={[settings.watermarkOpacity * 100]}
                    onValueChange={([value]) => setSettings({ ...settings, watermarkOpacity: value / 100 })}
                    min={5}
                    max={50}
                    step={5}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Signature */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Doctor Signature</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, "signature");
              }}
              disabled={uploading === "signature"}
              className="h-8 text-xs"
            />
            {settings.doctorSignatureUrl && (
              <img src={settings.doctorSignatureUrl} alt="Signature" className="h-12 object-contain border rounded" />
            )}
          </CardContent>
        </Card>

        {/* Information Fields */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Patient & Doctor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Patient Info</Label>
              <div className="grid grid-cols-2 gap-2">
                {PATIENT_INFO_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`patient-${option.value}`}
                      checked={settings.patientInfoFields.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSettings({
                            ...settings,
                            patientInfoFields: [...settings.patientInfoFields, option.value],
                          });
                        } else {
                          setSettings({
                            ...settings,
                            patientInfoFields: settings.patientInfoFields.filter((f) => f !== option.value),
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`patient-${option.value}`} className="text-xs">{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Doctor Info</Label>
              <div className="grid grid-cols-2 gap-2">
                {DOCTOR_INFO_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`doctor-${option.value}`}
                      checked={settings.doctorInfoFields.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSettings({
                            ...settings,
                            doctorInfoFields: [...settings.doctorInfoFields, option.value],
                          });
                        } else {
                          setSettings({
                            ...settings,
                            doctorInfoFields: settings.doctorInfoFields.filter((f) => f !== option.value),
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`doctor-${option.value}`} className="text-xs">{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rx Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Prescription Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useGenericName"
                checked={settings.useGenericName}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, useGenericName: checked as boolean })
                }
              />
              <Label htmlFor="useGenericName" className="text-sm">Show Generic Name</Label>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Preview Panel - Right Side (60%) */}
      <div className="lg:col-span-3">
        <Card className="sticky top-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                Live Preview
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrintPreview()}
                className="h-8"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print Preview
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <A4PreviewComponent settings={settings} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
