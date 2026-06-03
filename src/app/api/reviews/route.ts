import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/getCurrentUser";
import { CreateReviewSchema } from "@/lib/validations/review.schema";

interface ReviewRow {
  rating: number;
}

function buildStats(items: ReviewRow[]) {
  const total = items.length;
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of items) {
    counts[r.rating] = (counts[r.rating] || 0) + 1;
    sum += r.rating;
  }
  const average = total ? Number((sum / total).toFixed(2)) : 0;
  const distribution = {
    5: total ? Math.round((counts[5] / total) * 100) : 0,
    4: total ? Math.round((counts[4] / total) * 100) : 0,
    3: total ? Math.round((counts[3] / total) * 100) : 0,
    2: total ? Math.round((counts[2] / total) * 100) : 0,
    1: total ? Math.round((counts[1] / total) * 100) : 0,
  };
  return { total, average, distribution, counts };
}

// GET - public reviews with filtering, sorting, pagination, and aggregate stats.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const patientId = searchParams.get("patientId");
    const appointmentId = searchParams.get("appointmentId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const ratingMin = searchParams.get("ratingMin");
    const ratingMax = searchParams.get("ratingMax");
    const sort = (searchParams.get("sort") || "newest") as
      | "newest"
      | "oldest"
      | "highest"
      | "lowest";

    const where: Prisma.ReviewWhereInput = {};
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
    if (appointmentId) where.appointmentId = appointmentId;
    if (ratingMin || ratingMax) {
      where.rating = {};
      if (ratingMin) where.rating.gte = Math.max(1, Math.min(5, parseInt(ratingMin, 10)));
      if (ratingMax) where.rating.lte = Math.max(1, Math.min(5, parseInt(ratingMax, 10)));
    }

    const orderBy: Prisma.ReviewOrderByWithRelationInput[] =
      sort === "oldest"
        ? [{ createdAt: "asc" }]
        : sort === "highest"
          ? [{ rating: "desc" }, { createdAt: "desc" }]
          : sort === "lowest"
            ? [{ rating: "asc" }, { createdAt: "desc" }]
            : [{ createdAt: "desc" }];

    // Stats are computed over the full filtered set, then the page is sliced.
    const all = await prisma.review.findMany({ where, orderBy });
    const stats = buildStats(all);
    const start = (page - 1) * pageSize;
    const paged = all.slice(start, start + pageSize);

    return NextResponse.json({ success: true, data: paged, page, pageSize, ...stats });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST - a patient leaves a review (identity comes from the session)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "patient") {
      return NextResponse.json(
        { success: false, error: "Only patients can leave reviews" },
        { status: session ? 403 : 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = CreateReviewSchema.safeParse({
      ...body,
      patientId: session.sub,
      patientName: session.name,
      rating: body.rating != null ? Number(body.rating) : undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const created = await prisma.review.create({
      data: {
        appointmentId: parsed.data.appointmentId,
        patientId: session.sub,
        patientName: session.name,
        doctorId: parsed.data.doctorId,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create review" }, { status: 500 });
  }
}
