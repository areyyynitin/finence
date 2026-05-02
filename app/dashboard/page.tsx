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

    const stats = await getDashboardStats(firstOrgId);

    return (
        <AppShell user={session.user} organizations={organizations}>
            <div className="flex flex-col gap-10">
                
                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 border-4 border-foreground shadow-[8px_8px_0px_0px_#14110d] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#14110d] transition-all">
                        <p className="text-xs font-black text-foreground/60 uppercase tracking-widest mb-2">Total Balance</p>
                        <h2 className="text-4xl font-black tracking-tight">₹{stats.totalBalance.toLocaleString()}</h2>
                        <div className="mt-4 pt-4 border-t-2 border-foreground/10">
                            <span className="bg-emerald-400 text-black px-2 py-1 text-[10px] font-black uppercase border-2 border-foreground">Available</span>
                        </div>
                    </div>
                    <div className="bg-white p-8 border-4 border-foreground shadow-[8px_8px_0px_0px_#14110d] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#14110d] transition-all">
                        <p className="text-xs font-black text-foreground/60 uppercase tracking-widest mb-2">Total Income</p>
                        <h2 className="text-4xl font-black tracking-tight">₹{stats.totalIncome.toLocaleString()}</h2>
                        <div className="mt-4 pt-4 border-t-2 border-foreground/10">
                            <span className="bg-primary text-primary-foreground px-2 py-1 text-[10px] font-black uppercase border-2 border-foreground">Lifetime</span>
                        </div>
                    </div>
                    <div className="bg-white p-8 border-4 border-foreground shadow-[8px_8px_0px_0px_#14110d] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#14110d] transition-all">
                        <p className="text-xs font-black text-foreground/60 uppercase tracking-widest mb-2">Total Expenses</p>
                        <h2 className="text-4xl font-black tracking-tight">₹{stats.totalExpense.toLocaleString()}</h2>
                        <div className="mt-4 pt-4 border-t-2 border-foreground/10">
                            <span className="bg-accent text-accent-foreground px-2 py-1 text-[10px] font-black uppercase border-2 border-foreground">Outflow</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    {/* Brutalist Chart */}
                    <div className="lg:col-span-3 bg-white p-8 border-4 border-foreground shadow-[12px_12px_0px_0px_#14110d] flex flex-col min-h-[450px]">
                        <div className="flex items-center justify-between mb-10 pb-4 border-b-4 border-foreground">
                            <h3 className="text-xl font-black uppercase tracking-tighter">Monthly Analytics</h3>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-primary border-2 border-foreground"></div>
                                    <span className="text-[10px] font-black uppercase">Income</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-secondary border-2 border-foreground"></div>
                                    <span className="text-[10px] font-black uppercase">Expense</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex items-end justify-between px-4 pb-4 border-b-4 border-foreground relative h-64">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-full border-t-2 border-foreground"></div>)}
                            </div>

                            {stats.monthlyStats.map((m: any, idx: number) => {
                                const maxVal = Math.max(...stats.monthlyStats.map((s: any) => Math.max(s.income, s.expense))) || 1;
                                const incH = (m.income / maxVal) * 250;
                                const expH = (m.expense / maxVal) * 250;

                                return (
                                    <div key={idx} className="flex flex-col items-center gap-4 w-12 z-10">
                                        <div className="flex items-end gap-1.5 w-full h-[250px]">
                                            <div
                                                style={{ height: `${expH}px` }}
                                                className="flex-1 bg-secondary border-2 border-foreground shadow-[2px_2px_0px_0px_#14110d] transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#14110d]"
                                            ></div>
                                            <div
                                                style={{ height: `${incH}px` }}
                                                className="flex-1 bg-primary border-2 border-foreground shadow-[2px_2px_0px_0px_#14110d] transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#14110d]"
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-tighter bg-foreground text-white px-1">{m.month}</span>
                                    </div>
                                )
                            })}

                            {stats.monthlyStats.length === 0 && (
                                <div className="flex-1 flex items-center justify-center text-foreground font-black uppercase italic text-sm">
                                    Waiting for data...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Transactions List */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-white border-4 border-foreground shadow-[8px_8px_0px_0px_#14110d] flex flex-col overflow-hidden h-full">
                            <div className="p-6 border-b-4 border-foreground bg-accent/20">
                                <h3 className="text-lg font-black uppercase tracking-tighter">Recent Records</h3>
                            </div>
                            <div className="flex-1 divide-y-2 divide-foreground">
                                {stats.recentTransactions.map((tx: any) => (
                                    <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-secondary/10 transition-colors">
                                        <div className="flex flex-col min-w-0 pr-4">
                                            <span className="text-sm font-black uppercase truncate tracking-tight">{tx.description || tx.payerName || tx.reason || 'Record'}</span>
                                            <span className="text-[10px] font-bold text-foreground/60 uppercase mt-1">
                                                {tx.type === 'income' ? 'Income' : 'Expense'} • {format(new Date(tx.date), 'MMM d')}
                                            </span>
                                        </div>
                                        <span className={cn(
                                            "text-md font-black px-2 py-1 border-2 border-foreground",
                                            tx.type === 'income' ? "bg-emerald-400" : "bg-white"
                                        )}>
                                            {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                                {stats.recentTransactions.length === 0 && (
                                    <div className="p-20 text-center text-foreground/40 font-black uppercase italic text-sm">
                                        Nothing yet
                                    </div>
                                )}
                            </div>
                            <a href="/transactions" className="p-5 text-center text-xs font-black uppercase bg-foreground text-white hover:bg-foreground/90 transition-colors">
                                Full Transaction Log
                            </a>
                        </div>
                    </div>
                </div>

            </div>

            <TransactionModal />
        </AppShell>
    );
}
