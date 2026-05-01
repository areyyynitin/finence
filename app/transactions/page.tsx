import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TransactionModal } from "@/components/transaction-modal";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export default async function TransactionsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    const memberships = await prisma.member.findMany({
        where: { userId: session.user.id },
        include: { organization: true }
    });

    if (memberships.length === 0) {
        redirect('/onboarding');
    }

    const organizations = memberships.map(m => m.organization);
    const currentOrgId = organizations[0].id; // Simplified
    const currentMembership = memberships.find((m) => m.organizationId === currentOrgId);

    const transactions = await prisma.transaction.findMany({
        where: { organizationId: currentOrgId },
        orderBy: { date: 'desc' },
    });

    return (
        <AppShell user={session.user} organizations={organizations}>
            <div className="mb-4 flex items-center justify-end gap-2">
                {currentMembership?.role === "admin" && (
                    <>
                        <Button variant="outline" asChild className="text-white">
                            <a href={`/api/transaction/export?organizationId=${currentOrgId}&type=income`}>
                                Export Income
                            </a>
                        </Button>
                        <Button variant="outline" asChild className="text-white">
                            <a href={`/api/transaction/export?organizationId=${currentOrgId}&type=expense`}>
                                Export Expense
                            </a>
                        </Button>
                    </>
                )}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead className="w-[120px]">Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell className="font-medium">
                                    {format(new Date(tx.date), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-900">{tx.description || '-'}</span>
                                        <span className="text-xs text-slate-400">
                                            {tx.payerName && `Income from ${tx.payerName}`}
                                            {tx.reason && `Expense for ${tx.reason}`}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn(
                                        "font-semibold capitalize",
                                        tx.type === 'income' ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-700"
                                    )}>
                                        {tx.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500">{tx.category || 'General'}</TableCell>
                                <TableCell className={cn(
                                    "text-right font-bold",
                                    tx.type === 'income' ? "text-emerald-600" : "text-slate-900"
                                )}>
                                    {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                        {transactions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-slate-400 italic">
                                    No transactions found for this organization.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <TransactionModal />
        </AppShell>
    );
}
