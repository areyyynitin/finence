import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await req.json();


    try {
        const org = await prisma.organization.create({
            data: {
                name,
                description,
                members: {
                    create: {
                        userId: session.user.id,
                        role: 'admin'
                    }
                }
            }
        });

        return NextResponse.json(org);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const memberships = await prisma.member.findMany({
            where: { userId: session.user.id },
            include: { organization: true }
        });

        return NextResponse.json(memberships.map(m => m.organization));
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
