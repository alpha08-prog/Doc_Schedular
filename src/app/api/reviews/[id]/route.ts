import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/getCurrentUser";
import { UpdateReviewSchema } from "@/lib/validations/review.schema";

function canModify(createdAt: Date): boolean {
  const hours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  return hours <= 24;
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const review = await prisma.review.findUnique({ where: { id: params.id } });
    if (!review) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: review });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch review" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const current = await prisma.review.findUnique({ where: { id: params.id } });
    if (!current) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    if (current.patientId !== session.sub) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if (!canModify(current.createdAt)) {
      return NextResponse.json(
        { success: false, error: "Edit window expired (24h)" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = UpdateReviewSchema.safeParse({
      ...body,
      rating: body.rating != null ? Number(body.rating) : undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const next = await prisma.review.update({
      where: { id: params.id },
      data: {
        rating: parsed.data.rating ?? current.rating,
        comment: parsed.data.comment ?? current.comment,
      },
    });
    return NextResponse.json({ success: true, data: next });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const current = await prisma.review.findUnique({ where: { id: params.id } });
    if (!current) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    if (current.patientId !== session.sub) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if (!canModify(current.createdAt)) {
      return NextResponse.json(
        { success: false, error: "Delete window expired (24h)" },
        { status: 403 }
      );
    }

    await prisma.review.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: current });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete review" }, { status: 500 });
  }
}
