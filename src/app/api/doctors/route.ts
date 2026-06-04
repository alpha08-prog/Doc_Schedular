import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PLACEHOLDER_IMAGE = "/images/doctor-placeholder.jpg";

// This route hits the database, so it must never be statically prerendered at
// build time (the build env has no DB). Unlike the other API routes it reads
// neither the session nor the request, so Next would otherwise treat it as static.
export const dynamic = "force-dynamic";

// Public: returns the doctor catalog as a raw array (the browse UI expects Doctor[]).
export async function GET() {
  const doctors = await prisma.doctor.findMany({ orderBy: { name: "asc" } });
  // Ensure image is always a non-empty string so next/image never throws.
  const data = doctors.map((d) => ({ ...d, image: d.image || PLACEHOLDER_IMAGE }));
  return NextResponse.json(data);
}
