import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamInviteForm } from "@/components/team-invite-form";
import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
            <div className="space-y-6">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>
                            Manage people in {organizations[0].name}. Admins can invite new members by email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {currentMembership?.role === "admin" ? (
                            <TeamInviteForm organizationId={currentOrgId} />
                        ) : (
                            <p className="text-sm text-slate-500">Only admins can invite members.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Current Members</CardTitle>
                        <CardDescription>{members.length} member(s) in this organization</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-slate-100">
                            {members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{member.user.name || "Unnamed user"}</p>
                                        <p className="text-xs text-slate-500">{member.user.email}</p>
                                    </div>
                                    <Badge variant="outline" className="capitalize">
                                        {member.role}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
