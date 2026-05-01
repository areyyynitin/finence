import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TransactionModal } from "@/components/transaction-modal";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { getDashboardStats } from "@/src/lib/actions/dashboard";

export default async function DashboardPage() {
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
    const firstOrgId = organizations[0].id;

    // Note: In a real app, we'd use the selected org from a cookie or param.
    // For this exercise, we initialize with first found.
    const stats = await getDashboardStats(firstOrgId);

    return (
        <AppShell user={session.user} organizations={organizations}>
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Balance</p>
                        <h2 className="text-3xl font-light tracking-tight">₹{stats.totalBalance.toLocaleString()}</h2>
                        <p className="text-xs text-emerald-600 mt-2 font-medium">Net available funds</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Income</p>
                        <h2 className="text-3xl font-light tracking-tight">₹{stats.totalIncome.toLocaleString()}</h2>
                        <p className="text-xs text-slate-400 mt-2 font-medium">Lifetime received</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Expenses</p>
                        <h2 className="text-3xl font-light tracking-tight">₹{stats.totalExpense.toLocaleString()}</h2>
                        <p className="text-xs text-rose-500 mt-2 font-medium">Lifetime spent</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Chart Placeholder (simplified for this design) */}
                    <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-semibold">Monthly Analytics</h3>
                            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-slate-900"></div>
                                    <span>Income</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                    <span>Expenses</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex items-end justify-between px-4 pb-2 border-b border-slate-50">
                            {stats.monthlyStats.map((m: any, idx: number) => {
                                const maxVal = Math.max(...stats.monthlyStats.map((s: any) => Math.max(s.income, s.expense))) || 1;
                                const incH = (m.income / maxVal) * 200;
                                const expH = (m.expense / maxVal) * 200;

                                return (
                                    <div key={idx} className="flex flex-col items-center gap-2 w-12 group">
                                        <div className="flex items-end gap-1 w-full h-[200px]">
                                            <div
                                                style={{ height: `${expH}px` }}
                                                className="flex-1 bg-slate-100 rounded-t-sm transition-all group-hover:bg-slate-200"
                                            ></div>
                                            <div
                                                style={{ height: `${incH}px` }}
                                                className="flex-1 bg-slate-900 rounded-t-sm transition-all group-hover:bg-slate-800"
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-400">{m.month}</span>
                                    </div>
                                )
                            })}

                            {stats.monthlyStats.length === 0 && (
                                <div className="flex-1 flex items-center justify-center text-slate-300 text-sm italic">
                                    No data available yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-50">
                            <h3 className="text-sm font-semibold">Recent Transactions</h3>
                        </div>
                        <div className="flex-1">
                            <div className="divide-y divide-slate-50">
                                {stats.recentTransactions.map((tx: any) => (
                                    <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium truncate">{tx.description || tx.payerName || tx.reason}</span>
                                            <span className="text-xs text-slate-400">
                                                {tx.type === 'income' ? 'Income' : 'Expense'} • {format(new Date(tx.date), 'MMM d')}
                                            </span>
                                        </div>
                                        <span className={cn(
                                            "text-sm font-semibold",
                                            tx.type === 'income' ? "text-emerald-600" : "text-slate-900"
                                        )}>
                                            {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                                {stats.recentTransactions.length === 0 && (
                                    <div className="p-12 text-center text-slate-400 text-sm">
                                        No transactions recorded
                                    </div>
                                )}
                            </div>
                        </div>
                        <Link href="/transactions" className="p-4 text-center text-xs font-medium text-slate-400 hover:text-slate-600 bg-slate-50 transition-colors">
                            View All Activity
                        </Link>
                    </div>
                </div>

            </div>

            <TransactionModal />
        </AppShell>
    );
}

// Inline Link for brevity in shell
function Link({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) {
    return <a href={href} className={className}>{children}</a>
}
