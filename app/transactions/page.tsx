import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TransactionModal } from "@/components/transaction-modal";
import { DeleteTransactionButton } from "@/components/delete-transaction-button";
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
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Transactions</h2>
                    <p className="text-sm font-bold text-foreground/60 uppercase">History of all activities</p>
                </div>
                
                {currentMembership?.role === "admin" && (
                    <div className="flex flex-wrap gap-3">
                        <Button className="bg-white text-foreground border-2 border-foreground font-black uppercase shadow-[4px_4px_0px_0px_#14110d] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all rounded-none" asChild>
                            <a href={`/api/transaction/export?organizationId=${currentOrgId}&type=income`}>
                                Export Income
                            </a>
                        </Button>
                        <Button className="bg-white text-foreground border-2 border-foreground font-black uppercase shadow-[4px_4px_0px_0px_#14110d] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all rounded-none" asChild>
                            <a href={`/api/transaction/export?organizationId=${currentOrgId}&type=expense`}>
                                Export Expense
                            </a>
                        </Button>
                    </div>
                )}
            </div>

            <div className="bg-white border-4 border-foreground shadow-[8px_8px_0px_0px_#14110d] overflow-hidden overflow-x-auto">
                <Table className="border-collapse">
                    <TableHeader className="bg-secondary/20">
                        <TableRow className="border-b-4 border-foreground hover:bg-transparent">
                            <TableHead className="w-[140px] border-r-2 border-foreground font-black uppercase text-foreground py-4 px-6">Date</TableHead>
                            <TableHead className="border-r-2 border-foreground font-black uppercase text-foreground py-4 px-6">Details</TableHead>
                            <TableHead className="border-r-2 border-foreground font-black uppercase text-foreground py-4 px-6">Type</TableHead>
                            <TableHead className="border-r-2 border-foreground font-black uppercase text-foreground py-4 px-6">Category</TableHead>
                            <TableHead className="text-right font-black uppercase text-foreground py-4 px-6">Amount</TableHead>
                            {currentMembership?.role === "admin" && (
                                <TableHead className="w-[80px] border-l-2 border-foreground py-4 px-6"></TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx) => (
                            <TableRow key={tx.id} className="border-b-2 border-foreground last:border-0 hover:bg-accent/5 transition-colors">
                                <TableCell className="border-r-2 border-foreground font-bold py-4 px-6">
                                    {format(new Date(tx.date), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell className="border-r-2 border-foreground py-4 px-6">
                                    <div className="flex flex-col">
                                        <span className="font-black text-foreground uppercase tracking-tight">{tx.description || 'No Description'}</span>
                                        <span className="text-[10px] font-bold text-foreground/60 uppercase mt-1">
                                            {tx.payerName && `From: ${tx.payerName}`}
                                            {tx.reason && `For: ${tx.reason}`}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="border-r-2 border-foreground py-4 px-6">
                                    <Badge className={cn(
                                        "font-black uppercase text-[10px] rounded-none border-2 px-2 py-0.5",
                                        tx.type === 'income' 
                                            ? "bg-emerald-400 text-black border-foreground shadow-[2px_2px_0px_0px_#14110d]" 
                                            : "bg-orange-400 text-black border-foreground shadow-[2px_2px_0px_0px_#14110d]"
                                    )}>
                                        {tx.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="border-r-2 border-foreground font-bold uppercase text-xs py-4 px-6">
                                    {tx.category || 'General'}
                                </TableCell>
                                <TableCell className={cn(
                                    "text-right font-black text-lg py-4 px-6",
                                    tx.type === 'income' ? "text-emerald-600" : "text-foreground"
                                )}>
                                    {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                                </TableCell>
                                {currentMembership?.role === "admin" && (
                                    <TableCell className="text-center border-l-2 border-foreground py-4 px-6">
                                        <DeleteTransactionButton transactionId={tx.id} />
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                        {transactions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-foreground font-black uppercase italic py-4 px-6 bg-slate-50">
                                    No records found
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
