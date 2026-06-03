import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PLACEHOLDER_IMAGE = "/images/doctor-placeholder.jpg";

// Public: returns the doctor catalog as a raw array (the browse UI expects Doctor[]).
export async function GET() {
  const doctors = await prisma.doctor.findMany({ orderBy: { name: "asc" } });
  // Ensure image is always a non-empty string so next/image never throws.
  const data = doctors.map((d) => ({ ...d, image: d.image || PLACEHOLDER_IMAGE }));
  return NextResponse.json(data);
}
