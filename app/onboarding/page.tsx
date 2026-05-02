import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <div className="w-full max-w-lg bg-white border-4 border-foreground shadow-[12px_12px_0px_0px_#14110d] p-8 md:p-12 animate-in slide-in-from-bottom-8 duration-700">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Setup Org</h1>
                    <p className="text-sm font-bold text-foreground/60 uppercase">Create your first workspace to begin</p>
                </div>
                
                <form action={createOrganization} className="space-y-8">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="font-black uppercase text-xs">Organization name</Label>
                        <Input 
                            id="name" 
                            name="name" 
                            placeholder="Acme Finance" 
                            required 
                            className="border-2 border-foreground rounded-none font-bold bg-white focus-visible:ring-0 placeholder:text-foreground/30 h-12"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="font-black uppercase text-xs">Description (optional)</Label>
                        <Input 
                            id="description" 
                            name="description" 
                            placeholder="Team budget and expense tracking" 
                            className="border-2 border-foreground rounded-none font-bold bg-white focus-visible:ring-0 placeholder:text-foreground/30 h-12"
                        />
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full bg-primary text-primary-foreground border-2 border-foreground font-black uppercase rounded-none shadow-[4px_4px_0px_0px_#14110d] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all h-14"
                    >
                        Continue to Dashboard
                    </Button>
                </form>
            </div>
        </div>
    );
}
