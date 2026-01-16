import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { title, name, email, password } = await req.json();

  if (!title || !name || !email || !password) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  const exist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (exist) {
    return new NextResponse("User already exists", { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      title,
      name,
      email,
      password: hashedPassword,
    },
  });

  return NextResponse.json(user);
}
