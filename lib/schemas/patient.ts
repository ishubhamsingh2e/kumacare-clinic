import { z } from "zod";
import {
	Gender,
	MaritalStatus,
	BloodGroup,
} from "@/lib/generated/prisma/enums";

export const patientSchema = z.object({
	phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
	name: z.string().min(3, "Name must be at least 3 characters"),
	gender: z.nativeEnum(Gender),
	// Client-side only field to control DOB input type
	dob_type: z.enum(["date", "age"]).default("date"),
	dob: z.date(),
	is_dob_estimate: z.boolean().default(false),
	city: z.string().optional(),
	address: z.string().optional(),
	pin_code: z.string().optional(),
	marital_status: z.nativeEnum(MaritalStatus).optional(),
	when_field: z.string().optional(),
	blood_group: z.nativeEnum(BloodGroup).optional(),
	spouse_blood_group: z.nativeEnum(BloodGroup).optional(),
	spouse_name: z.string().optional(),
	referred_by: z.string().optional(),
	email: z.string().email("Invalid email address").optional().or(z.literal("")),
	how_did_you_hear_about_us: z.string().optional(),
	care_of: z.string().optional(),
	occupation: z.string().optional(),
	tag: z.array(z.string()).optional(), // Added for MultiSelect
	alternative_phone: z.string().optional(),
	aadhar_number: z.string().optional(),
});

export type PatientSchema = z.infer<typeof patientSchema>;
