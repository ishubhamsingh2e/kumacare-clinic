/**
 * Prescription Template Generator
 * Generates HTML for prescription printing based on print settings and data
 */

export interface PrescriptionData {
  patient: {
    name?: string;
    age?: string;
    gender?: string;
    phone?: string;
    email?: string;
    address?: string;
    bloodGroup?: string;
  };
  doctor: {
    name?: string;
    title?: string;
    licenseNumber?: string;
    phone?: string;
    email?: string;
  };
  clinic: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  medicines: Array<{
    name: string;
    genericName?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    qty?: string;
    administration?: string;
    time?: string;
    when?: string;
  }>;
  date: string;
  prescriptionId?: string;
}

export interface PrintSettings {
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

/**
 * Generates HTML for prescription based on template and settings
 */
export function generatePrescriptionHTML(
  data: PrescriptionData,
  settings: PrintSettings
): string {
  const { patient, doctor, clinic, medicines, date, prescriptionId } = data;

  // Template-specific styles
  const getHeaderClass = () => {
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

  const getSectionClass = () => {
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

  // Patient info rows
  const patientInfoRows = settings.patientInfoFields
    .map((field) => {
      const value = patient[field as keyof typeof patient];
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

  // Doctor info rows
  const doctorInfoRows = settings.doctorInfoFields
    .map((field) => {
      const value = doctor[field as keyof typeof doctor];
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

  // Medicine table rows
  const medicineRows = medicines
    .map(
      (med, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#FFFFFF' : '#F9FAFB'};">
        <td style="border: 1px solid #9CA3AF; padding: 6px 8px;">${index + 1}</td>
        <td style="border: 1px solid #9CA3AF; padding: 6px 8px;">
          <div style="font-weight: 500;">${med.name}</div>
          ${settings.useGenericName && med.genericName ? `<div style="color: #6B7280; font-size: 11px;">(${med.genericName})</div>` : ""}
        </td>
        <td style="border: 1px solid #9CA3AF; padding: 6px 8px;">${med.dosage || "-"}</td>
        <td style="border: 1px solid #9CA3AF; padding: 6px 8px;">${med.frequency || "-"}</td>
        <td style="border: 1px solid #9CA3AF; padding: 6px 8px;">${med.duration || "-"}</td>
        <td style="border: 1px solid #9CA3AF; padding: 6px 8px; text-align: center;">${med.qty || "-"}</td>
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
      : `<div style="margin-bottom: 12px; ${getHeaderClass()}">
          <div style="text-align: ${settings.templateType === "minimal" ? "left" : "center"};">
            <h1 style="font-weight: bold; color: #111827; font-size: ${settings.templateType === "minimal" ? "18px" : "20px"}; margin: 0;">${clinic.name}</h1>
            ${
              settings.templateType !== "minimal"
                ? `<p style="font-size: 12px; color: #374151; margin: 2px 0;">${doctor.name} • ${doctor.title}</p>
                   <p style="font-size: 12px; color: #6B7280; margin: 2px 0;">${doctor.licenseNumber} • ${doctor.phone}</p>`
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
            <p style="font-size: 12px; font-weight: 500; margin: 0;">${doctor.name}</p>
            <p style="font-size: 12px; color: #6B7280; margin: 0;">${doctor.licenseNumber}</p>
          </div>
        </div>
      </div>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Prescription - ${patient.name}</title>
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
          patientInfoRows
            ? `<div style="${getSectionClass()}">
                <h2 style="font-size: 12px; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase;">Patient Information</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px;">
                  ${patientInfoRows}
                </div>
              </div>`
            : ""
        }
        
        ${
          doctorInfoRows
            ? `<div style="${getSectionClass()}">
                <h2 style="font-size: 12px; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase;">Doctor Information</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px;">
                  ${doctorInfoRows}
                </div>
              </div>`
            : ""
        }
        
        <div style="${getSectionClass()}">
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
}

/**
 * Generates print-ready HTML with proper page size
 */
export function generatePrintHTML(
  data: PrescriptionData,
  settings: PrintSettings
): string {
  return generatePrescriptionHTML(data, settings);
}
