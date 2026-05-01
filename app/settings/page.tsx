import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
            <div className="space-y-6">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Your account details from authentication.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Name</p>
                            <p className="text-sm font-medium text-slate-900">{session.user.name || "Not set"}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                            <p className="text-sm font-medium text-slate-900">{session.user.email}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Organization Access</CardTitle>
                        <CardDescription>Current organizations and your role in each.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-slate-100">
                            {memberships.map((membership) => (
                                <div key={membership.id} className="flex items-center justify-between py-3">
                                    <span className="text-sm text-slate-900">{membership.organization.name}</span>
                                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{membership.role}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
