import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function OrganizationsPage() {
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

    async function createOrganization(formData: FormData) {
        "use server";

        const requestSession = await auth.api.getSession({
            headers: await headers()
        });

        if (!requestSession) {
            redirect("/login");
        }

        const name = String(formData.get("name") ?? "").trim();
        const description = String(formData.get("description") ?? "").trim();

        if (!name) {
            return;
        }

        await prisma.organization.create({
            data: {
                name,
                description: description || null,
                members: {
                    create: {
                        userId: requestSession.user.id,
                        role: "admin"
                    }
                }
            }
        });

        redirect("/organizations");
    }

    const organizations = memberships.map((m) => m.organization);

    return (
        <AppShell user={session.user} organizations={organizations}>
            <div className="space-y-6">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Create Organization</CardTitle>
                        <CardDescription>Add a new workspace for another team or business unit.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={createOrganization} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                            <div className="space-y-2">
                                <Label htmlFor="org-name">Name</Label>
                                <Input id="org-name" name="name" required placeholder="North Region Ops" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="org-description">Description</Label>
                                <Input id="org-description" name="description" placeholder="Optional" />
                            </div>
                            <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">Create</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Your Organizations</CardTitle>
                        <CardDescription>{memberships.length} organization membership(s)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-slate-100">
                            {memberships.map((membership) => (
                                <div key={membership.id} className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{membership.organization.name}</p>
                                        <p className="text-xs text-slate-500">{membership.organization.description || "No description"}</p>
                                    </div>
                                    <Badge variant="outline" className="capitalize">{membership.role}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
