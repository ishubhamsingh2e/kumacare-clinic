"use client";

interface PrintSettings {
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

interface A4PreviewComponentProps {
  settings: PrintSettings;
}

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

export function A4PreviewComponent({ settings }: A4PreviewComponentProps) {
  // Template-specific header styles (all black & white)
  const getHeaderStyle = () => {
    switch (settings.templateType) {
      case "classic":
        return "border-b-2 border-black pb-2";
      case "modern":
        return "border-b-4 border-black pb-3";
      case "minimal":
        return "border-b border-gray-400 pb-1";
      case "professional":
        return "border-b-2 border-double border-black pb-3";
      case "medical":
        return "bg-gray-100 border-2 border-black p-3 mb-3";
      default:
        return "border-b-2 border-black pb-2";
    }
  };

  const getSectionStyle = () => {
    switch (settings.templateType) {
      case "classic":
        return "border border-gray-300 p-2 mb-2";
      case "modern":
        return "border-l-4 border-black pl-3 py-1 mb-2";
      case "minimal":
        return "mb-2";
      case "professional":
        return "border border-gray-400 rounded p-2 mb-2";
      case "medical":
        return "bg-gray-50 border border-gray-300 p-2 mb-2";
      default:
        return "border border-gray-300 p-2 mb-2";
    }
  };

  return (
    <div className="bg-gray-200 p-4 rounded-lg overflow-auto max-h-[800px]">
      {/* A4 Paper */}
      <div
        className="bg-white shadow-lg mx-auto relative"
        style={{
          width: "595px",
          minHeight: "842px",
          paddingTop: `${settings.marginTop * 3.78}px`,
          paddingBottom: `${settings.marginBottom * 3.78}px`,
          paddingLeft: `${settings.marginLeft * 3.78}px`,
          paddingRight: `${settings.marginRight * 3.78}px`,
        }}
      >
        {/* Watermark */}
        {settings.enableWatermark && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: settings.watermarkOpacity }}
          >
            {settings.watermarkImageUrl ? (
              <img
                src={settings.watermarkImageUrl}
                alt="Watermark"
                className="max-w-[50%] max-h-[50%] object-contain"
              />
            ) : settings.watermarkText ? (
              <div className="text-6xl font-bold text-gray-400 rotate-[-45deg]">
                {settings.watermarkText}
              </div>
            ) : (
              <div className="text-6xl font-bold text-gray-400 rotate-[-45deg]">
                CONFIDENTIAL
              </div>
            )}
          </div>
        )}

        {/* Header */}
        {settings.useCustomHeader && settings.headerImageUrl ? (
          <div className="mb-4">
            <img
              src={settings.headerImageUrl}
              alt="Header"
              className="w-full object-contain max-h-20"
            />
          </div>
        ) : (
          <div className={`mb-3 ${getHeaderStyle()}`}>
            <div className={settings.templateType === "minimal" ? "text-left" : "text-center"}>
              <h1 className={`font-bold text-gray-900 ${settings.templateType === "minimal" ? "text-lg" : "text-xl"}`}>
                CLINIC NAME
              </h1>
              {settings.templateType !== "minimal" && (
                <>
                  <p className="text-xs text-gray-700 mt-0.5">
                    {sampleDoctor.name} • {sampleDoctor.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {sampleDoctor.licenseNumber} • {sampleDoctor.phone}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Content - Dense Layout */}
        <div className="space-y-2 text-sm">
          {/* Patient Information */}
          {settings.patientInfoFields.length > 0 && (
            <div className={getSectionStyle()}>
              <h2 className="text-xs font-bold mb-1 uppercase">Patient Information</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                {settings.patientInfoFields.includes("name") && (
                  <div><span className="font-medium">Name:</span> {samplePatient.name}</div>
                )}
                {settings.patientInfoFields.includes("age") && (
                  <div><span className="font-medium">Age:</span> {samplePatient.age}</div>
                )}
                {settings.patientInfoFields.includes("gender") && (
                  <div><span className="font-medium">Gender:</span> {samplePatient.gender}</div>
                )}
                {settings.patientInfoFields.includes("phone") && (
                  <div><span className="font-medium">Phone:</span> {samplePatient.phone}</div>
                )}
                {settings.patientInfoFields.includes("email") && (
                  <div><span className="font-medium">Email:</span> {samplePatient.email}</div>
                )}
                {settings.patientInfoFields.includes("bloodGroup") && (
                  <div><span className="font-medium">Blood:</span> {samplePatient.bloodGroup}</div>
                )}
                {settings.patientInfoFields.includes("address") && (
                  <div className="col-span-2"><span className="font-medium">Address:</span> {samplePatient.address}</div>
                )}
              </div>
            </div>
          )}

          {/* Doctor Information */}
          {settings.doctorInfoFields.length > 0 && (
            <div className={getSectionStyle()}>
              <h2 className="text-xs font-bold mb-1 uppercase">Doctor Information</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                {settings.doctorInfoFields.includes("name") && (
                  <div><span className="font-medium">Name:</span> {sampleDoctor.name}</div>
                )}
                {settings.doctorInfoFields.includes("title") && (
                  <div><span className="font-medium">Qualification:</span> {sampleDoctor.title}</div>
                )}
                {settings.doctorInfoFields.includes("licenseNumber") && (
                  <div><span className="font-medium">License:</span> {sampleDoctor.licenseNumber}</div>
                )}
                {settings.doctorInfoFields.includes("phone") && (
                  <div><span className="font-medium">Phone:</span> {sampleDoctor.phone}</div>
                )}
                {settings.doctorInfoFields.includes("email") && (
                  <div className="col-span-2"><span className="font-medium">Email:</span> {sampleDoctor.email}</div>
                )}
              </div>
            </div>
          )}

          {/* Prescription - Table Format */}
          <div className={getSectionStyle()}>
            <h2 className="text-sm font-bold mb-2 uppercase">℞ Prescription</h2>
            <table className="w-full border-collapse border border-gray-400 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-2 py-1 text-left w-8">#</th>
                  <th className="border border-gray-400 px-2 py-1 text-left">Medicine {settings.useGenericName && "(Generic)"}</th>
                  <th className="border border-gray-400 px-2 py-1 text-left">Dosage</th>
                  <th className="border border-gray-400 px-2 py-1 text-left">Frequency</th>
                  <th className="border border-gray-400 px-2 py-1 text-left">Duration</th>
                  <th className="border border-gray-400 px-2 py-1 text-left w-12">Qty</th>
                </tr>
              </thead>
              <tbody>
                {sampleMedicines.map((med, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-400 px-2 py-1.5">{index + 1}</td>
                    <td className="border border-gray-400 px-2 py-1.5">
                      <div className="font-medium">{med.name}</div>
                      {settings.useGenericName && med.genericName && (
                        <div className="text-gray-600 text-xs">({med.genericName})</div>
                      )}
                    </td>
                    <td className="border border-gray-400 px-2 py-1.5">{med.dosage}</td>
                    <td className="border border-gray-400 px-2 py-1.5">{med.frequency}</td>
                    <td className="border border-gray-400 px-2 py-1.5">{med.duration}</td>
                    <td className="border border-gray-400 px-2 py-1.5 text-center">{med.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature */}
          {settings.doctorSignatureUrl && (
            <div className="flex justify-end mt-4">
              <div className="text-center">
                <img
                  src={settings.doctorSignatureUrl}
                  alt="Signature"
                  className="h-12 object-contain mb-1"
                />
                <div className="border-t border-black pt-0.5">
                  <p className="text-xs font-medium">{sampleDoctor.name}</p>
                  <p className="text-xs text-gray-600">{sampleDoctor.licenseNumber}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {settings.useCustomFooter && settings.footerImageUrl ? (
          <div className="mt-4 pt-2 border-t">
            <img
              src={settings.footerImageUrl}
              alt="Footer"
              className="w-full object-contain max-h-12"
            />
          </div>
        ) : (
          <div className="mt-4 pt-2 border-t border-gray-300 text-center text-xs text-gray-500">
            <p>This is a computer-generated prescription</p>
          </div>
        )}
      </div>
    </div>
  );
}
