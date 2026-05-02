import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

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
            <div className="space-y-10">
                <div className="bg-white border-4 border-foreground shadow-[8px_8px_0px_0px_#14110d] p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-black uppercase tracking-tight">Create Organization</h2>
                        <p className="text-sm font-bold text-foreground/60 uppercase">Add a new workspace for another team</p>
                    </div>
                    <form action={createOrganization} className="grid gap-6 md:grid-cols-[1fr_1fr_auto] md:items-end">
                        <div className="space-y-2">
                            <Label htmlFor="org-name" className="font-black uppercase text-xs">Name</Label>
                            <Input 
                                id="org-name" 
                                name="name" 
                                required 
                                placeholder="North Region Ops" 
                                className="border-2 border-foreground rounded-none font-bold bg-white focus-visible:ring-0 placeholder:text-foreground/30 h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="org-description" className="font-black uppercase text-xs">Description</Label>
                            <Input 
                                id="org-description" 
                                name="description" 
                                placeholder="Optional" 
                                className="border-2 border-foreground rounded-none font-bold bg-white focus-visible:ring-0 placeholder:text-foreground/30 h-12"
                            />
                        </div>
                        <Button 
                            type="submit" 
                            className="bg-primary text-primary-foreground border-2 border-foreground font-black uppercase rounded-none shadow-[4px_4px_0px_0px_#14110d] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all h-12 px-8"
                        >
                            Create
                        </Button>
                    </form>
                </div>

                <div className="bg-white border-4 border-foreground shadow-[8px_8px_0px_0px_#14110d] overflow-hidden">
                    <div className="p-8 border-b-4 border-foreground bg-accent/10">
                        <h2 className="text-2xl font-black uppercase tracking-tight">Your Organizations</h2>
                        <p className="text-sm font-bold text-foreground/60 uppercase">{memberships.length} active memberships</p>
                    </div>
                    <div className="divide-y-2 divide-foreground">
                        {memberships.map((membership) => (
                            <div key={membership.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-8 hover:bg-secondary/5 transition-colors gap-4">
                                <div className="flex flex-col">
                                    <p className="text-xl font-black uppercase tracking-tight">{membership.organization.name}</p>
                                    <p className="text-sm font-bold text-foreground/50 uppercase">{membership.organization.description || "No description provided"}</p>
                                </div>
                                <Badge className={cn(
                                    "w-fit font-black uppercase text-xs rounded-none border-2 px-3 py-1 shadow-[2px_2px_0px_0px_#14110d]",
                                    membership.role === "admin" ? "bg-emerald-400 text-black border-foreground" : "bg-white text-black border-foreground"
                                )}>
                                    {membership.role}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
