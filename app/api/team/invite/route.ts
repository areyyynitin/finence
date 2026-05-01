import { auth } from "@/src/lib/auth";
import { sendAppEmail } from "@/src/lib/mailer";
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

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const role = body.role === "admin" ? "admin" : "viewer";
    const organizationId = String(body.organizationId ?? "");

    if (!email || !organizationId) {
        return NextResponse.json({ error: "Email and organizationId are required" }, { status: 400 });
    }

    const requester = await prisma.member.findFirst({
        where: {
            organizationId,
            userId: session.user.id
        },
        include: {
            organization: true
        }
    });

    if (!requester || requester.role !== "admin") {
        return NextResponse.json({ error: "Only admins can invite members" }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (!existingUser) {
        try {
            await sendAppEmail({
                to: email,
                subject: `You are invited to ${requester.organization.name}`,
                text: `${session.user.name ?? "An admin"} invited you to join ${requester.organization.name} on Fin Tecch. Sign up at ${process.env.BETTER_AUTH_URL}/signup, then ask the admin to invite this email again.`
            });
        } catch (error) {
            console.error("Failed to send invite email", error);
        }

        return NextResponse.json({
            message: "User not found. Invitation email was sent asking them to sign up first."
        });
    }

    const alreadyMember = await prisma.member.findUnique({
        where: {
            organizationId_userId: {
                organizationId,
                userId: existingUser.id
            }
        }
    });

    if (alreadyMember) {
        return NextResponse.json({ error: "User is already a member of this organization" }, { status: 409 });
    }

    const member = await prisma.member.create({
        data: {
            organizationId,
            userId: existingUser.id,
            role
        }
    });

    try {
        await sendAppEmail({
            to: email,
            subject: `Added to ${requester.organization.name}`,
            text: `You have been added as a ${role} in ${requester.organization.name}. You can now log in at ${process.env.BETTER_AUTH_URL}/login.`
        });
    } catch (error) {
        console.error("Failed to send member email", error);
    }

    return NextResponse.json({
        message: "Member added successfully",
        member
    });
}
