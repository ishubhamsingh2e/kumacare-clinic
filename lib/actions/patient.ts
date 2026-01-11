"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { patientSchema } from "@/lib/schemas/patient";
import { z } from "zod";

export async function registerPatient(prevState: any, formData: FormData) {
	// Correctly handle array fields like 'tag'
	const rawData: { [key: string]: any } = {};
	for (const [key, value] of formData.entries()) {
		if (key === "tag[]") {
			// Check if the key indicates an array
			if (!rawData["tag"]) {
				rawData["tag"] = [];
			}
			(rawData["tag"] as string[]).push(value as string);
		} else {
			rawData[key] = value;
		}
	}

	// Data transformation for dob/age
	let dob: Date | undefined;
	let is_dob_estimate = false;

	if (rawData.dob_type === "age") {
		const years = parseInt(rawData.dob_years as string, 10) || 0;
		const months = parseInt(rawData.dob_months as string, 10) || 0;
		const days = parseInt(rawData.dob_days as string, 10) || 0;

		if (years > 0 || months > 0 || days > 0) {
			const today = new Date();
			dob = new Date(
				today.getFullYear() - years,
				today.getMonth() - months,
				today.getDate() - days,
			);
			is_dob_estimate = true;
		}
	} else if (rawData.dob) {
		dob = new Date(rawData.dob as string);
	}

	const transformedData = {
		...rawData,
		dob,
		is_dob_estimate,
		gender: rawData.gender,
		marital_status: rawData.marital_status || undefined,
		blood_group: rawData.blood_group || undefined,
		spouse_blood_group: rawData.spouse_blood_group || undefined,
	};

	const validation = patientSchema.safeParse(transformedData);

	if (!validation.success) {
		return {
			message: "Validation failed",
			errors: validation.error.flatten().fieldErrors,
			type: "error",
		};
	}

	// Remove fields not in the prisma model before sending to db.
	const { dob_type, ...patientData } = validation.data;

	try {
		await prisma.patient.create({
			data: {
				...patientData,
				tag: patientData.tag ? patientData.tag.join(",") : undefined, // Convert array to comma-separated string for Prisma
			},
		});

		revalidatePath("/dashboard/patients");
		return { message: "Patient registered successfully", type: "success" };
	} catch (error: any) {
		if (error.code === "P2002") {
			const target = error.meta?.target as string[];
			if (target?.includes("email")) {
				return { message: "This email is already in use.", type: "error" };
			}
			if (target?.includes("aadhar_number")) {
				return {
					message: "This Aadhar number is already in use.",
					type: "error",
				};
			}
		}
		return { message: "Failed to register patient", type: "error" };
	}
}
