import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { TeamInviteForm } from "@/components/team-invite-form";
import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

export default async function TeamPage() {
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
    const currentOrgId = organizations[0].id;

    const currentMembership = memberships.find((m) => m.organizationId === currentOrgId);

    const members = await prisma.member.findMany({
        where: { organizationId: currentOrgId },
        include: { user: true },
        orderBy: { createdAt: "asc" }
    });

    return (
        <AppShell user={session.user} organizations={organizations}>
            <div className="space-y-10">
                <div className="bg-white border-4 border-foreground shadow-[8px_8px_0px_0px_#14110d] p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-black uppercase tracking-tight">Manage Team</h2>
                        <p className="text-sm font-bold text-foreground/60 uppercase">
                            Members in <span className="text-primary">{organizations[0].name}</span>
                        </p>
                    </div>
                    <div>
                        {currentMembership?.role === "admin" ? (
                            <TeamInviteForm organizationId={currentOrgId} />
                        ) : (
                            <div className="p-4 bg-secondary/10 border-2 border-dashed border-foreground/30">
                                <p className="text-xs font-black uppercase text-foreground/50">Only admins can invite new members.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white border-4 border-foreground shadow-[8px_8px_0px_0px_#14110d] overflow-hidden">
                    <div className="p-8 border-b-4 border-foreground bg-accent/10">
                        <h2 className="text-2xl font-black uppercase tracking-tight">Active Members</h2>
                        <p className="text-sm font-bold text-foreground/60 uppercase">{members.length} collaborators</p>
                    </div>
                    <div className="divide-y-2 divide-foreground">
                        {members.map((member) => (
                            <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-8 hover:bg-secondary/5 transition-colors gap-4">
                                <div className="flex flex-col">
                                    <p className="text-xl font-black uppercase tracking-tight">{member.user.name || "Anonymous Member"}</p>
                                    <p className="text-sm font-bold text-foreground/50 uppercase tracking-tighter">{member.user.email}</p>
                                </div>
                                <Badge className={cn(
                                    "w-fit font-black uppercase text-xs rounded-none border-2 px-3 py-1 shadow-[2px_2px_0px_0px_#14110d]",
                                    member.role === "admin" ? "bg-emerald-400 text-black border-foreground" : "bg-white text-black border-foreground"
                                )}>
                                    {member.role}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
