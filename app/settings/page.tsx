import { AppShell } from "@/components/app-shell";
import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

export default async function SettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/login");
    }

    const memberships = await prisma.member.findMany({
        where: { userId: session.user.id },
        include: { organization: true },
        orderBy: { createdAt: "asc" }
    });

    if (memberships.length === 0) {
        redirect("/onboarding");
    }

    const organizations = memberships.map((m) => m.organization);

    return (
        <AppShell user={session.user} organizations={organizations}>
            <div className="space-y-10">
                <div className="bg-white border-4 border-foreground shadow-[8px_8px_0px_0px_#14110d] p-8">
                    <div className="mb-8 border-b-4 border-foreground pb-4">
                        <h2 className="text-2xl font-black uppercase tracking-tight">Your Profile</h2>
                        <p className="text-sm font-bold text-foreground/60 uppercase">Personal account information</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-secondary/10 p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_#14110d]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2">Full Name</p>
                            <p className="text-lg font-black uppercase">{session.user.name || "Not specified"}</p>
                        </div>
                        <div className="bg-primary/10 p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_#14110d]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2">Email Address</p>
                            <p className="text-lg font-black">{session.user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-4 border-foreground shadow-[8px_8px_0px_0px_#14110d] overflow-hidden">
                    <div className="p-8 border-b-4 border-foreground bg-accent/10">
                        <h2 className="text-2xl font-black uppercase tracking-tight">Access Control</h2>
                        <p className="text-sm font-bold text-foreground/60 uppercase">Roles across organizations</p>
                    </div>
                    <div className="divide-y-2 divide-foreground">
                        {memberships.map((membership) => (
                            <div key={membership.id} className="flex items-center justify-between p-8 hover:bg-secondary/5 transition-colors">
                                <span className="text-lg font-black uppercase tracking-tight">{membership.organization.name}</span>
                                <span className={cn(
                                    "font-black uppercase text-[10px] px-2 py-1 border-2 border-foreground shadow-[2px_2px_0px_0px_#14110d]",
                                    membership.role === "admin" ? "bg-emerald-400" : "bg-white"
                                )}>
                                    {membership.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
