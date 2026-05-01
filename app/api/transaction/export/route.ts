import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

function csvEscape(value: string | number | null | undefined) {
    if (value === null || value === undefined) {
        return "";
    }
    const stringValue = String(value);
    if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, "\"\"")}"`;
    }
    return stringValue;
}

export async function GET(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");
    const type = searchParams.get("type");

    if (!organizationId || (type !== "income" && type !== "expense")) {
        return NextResponse.json({ error: "organizationId and valid type are required" }, { status: 400 });
    }

    const member = await prisma.member.findFirst({
        where: {
            organizationId,
            userId: session.user.id
        }
    });

    if (!member || member.role !== "admin") {
        return NextResponse.json({ error: "Only admins can export CSV" }, { status: 403 });
    }

    const transactions = await prisma.transaction.findMany({
        where: {
            organizationId,
            type
        },
        orderBy: {
            date: "desc"
        }
    });

    const headersRow = [
        "id",
        "date",
        "type",
        "amount",
        "description",
        "category",
        "payerName",
        "email",
        "reason"
    ];

    const rows = transactions.map((tx) => [
        csvEscape(tx.id),
        csvEscape(tx.date.toISOString()),
        csvEscape(tx.type),
        csvEscape(tx.amount),
        csvEscape(tx.description),
        csvEscape(tx.category),
        csvEscape(tx.payerName),
        csvEscape(tx.email),
        csvEscape(tx.reason)
    ].join(","));

    const csv = [headersRow.join(","), ...rows].join("\n");
    const filename = `${type}-transactions-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`
        }
    });
}
