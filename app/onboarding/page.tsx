import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function OnboardingPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/login");
    }

    const existingMembership = await prisma.member.findFirst({
        where: { userId: session.user.id },
        select: { id: true }
    });

    if (existingMembership) {
        redirect("/dashboard");
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

        redirect("/dashboard");
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-lg border-slate-200 shadow-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-semibold tracking-tight">Set up your organization</CardTitle>
                    <CardDescription>
                        Create your first organization to continue to the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createOrganization} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Organization name</Label>
                            <Input id="name" name="name" placeholder="Acme Finance" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (optional)</Label>
                            <Input id="description" name="description" placeholder="Team budget and expense tracking" />
                        </div>
                        <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800">
                            Continue to Dashboard
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
