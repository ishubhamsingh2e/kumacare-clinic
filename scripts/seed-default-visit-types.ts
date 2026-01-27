import { prisma } from "../lib/db";

async function main() {
  console.log("🌱 Seeding default visit types for all clinics...");

  const clinics = await prisma.clinic.findMany({
    select: { id: true, name: true },
  });

  console.log(`Found ${clinics.length} clinics`);

  for (const clinic of clinics) {
    // Check if clinic already has a default visit type
    const existingDefault = await prisma.visitType.findFirst({
      where: {
        clinicId: clinic.id,
        isDefault: true,
      },
    });

    if (existingDefault) {
      console.log(`✓ Clinic "${clinic.name}" already has a default visit type: ${existingDefault.name}`);
      continue;
    }

    // Create default "First Visit" type
    const visitType = await prisma.visitType.create({
      data: {
        clinicId: clinic.id,
        name: "First Visit",
        description: "Default visit type for online/self-booking appointments",
        defaultRate: 0,
        isDefault: true,
        isActive: true,
      },
    });

    console.log(`✅ Created default visit type for clinic "${clinic.name}": ${visitType.name} (rate: $${visitType.defaultRate})`);
  }

  console.log("\n✨ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding visit types:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
