import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { sendAppEmail } from "@/src/lib/mailer";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    try {
        const membership = await prisma.member.findFirst({
            where: {
                userId: session.user.id,
                organizationId: data.organizationId
            }
        });

        if (!membership) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const transaction = await prisma.transaction.create({
            data: {
                type: data.type,
                amount: data.amount,
                description: data.description,
                category: data.category,
                date: new Date(data.date),
                organizationId: data.organizationId,
                payerName: data.payerName,
                email: data.email,
                reason: data.reason,
            },
            include: {
                organization: true
            }
        });

        if (transaction.type === "income" && transaction.email) {
            try {
                await sendAppEmail({
                    to: transaction.email,
                    subject: "Payment Received",
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
                            <h2 style="color: #10b981;">Payment Received</h2>
                            <p>Thank you for your payment to <strong>${transaction.organization.name}</strong>.</p>
                            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                               <p style="margin: 5px 0;"><strong>Name:</strong> ${transaction.payerName ?? "a payer"}</p>
                                <p style="margin: 5px 0;"><strong>Amount:</strong> INR ${transaction.amount.toLocaleString()}</p>
                                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(transaction.date).toLocaleDateString()}</p>
                            </div>
                            <p style="color: #6b7280; font-size: 0.875rem;">If you have any questions, please contact the organization directly.</p>
                        </div>
                    `,
                });
            } catch (emailError) {
                console.error("Failed to send email", emailError);
            }
        }

        return NextResponse.json(transaction);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('organizationId');

    if (!orgId) {
        return NextResponse.json({ error: "Org ID required" }, { status: 400 });
    }

    try {
        const membership = await prisma.member.findFirst({
            where: {
                userId: session.user.id,
                organizationId: orgId
            }
        });

        if (!membership) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const transactions = await prisma.transaction.findMany({
            where: { organizationId: orgId },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json(transactions);
    } catch {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
