import { PatientRegistrationForm } from "@/components/forms/patient-registration-form";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function NewPatientPage() {
  return (
    <div className="flex-1 space-y-4">
      <Card>
        <CardContent>
          <PatientRegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
}
