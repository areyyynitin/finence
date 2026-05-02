import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            select: { organizationId: true }
        });

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        const membership = await prisma.member.findFirst({
            where: {
                userId: session.user.id,
                organizationId: transaction.organizationId,
                role: "admin" // Only admins can delete
            }
        });

        if (!membership) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.transaction.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
    }
}
