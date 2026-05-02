'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function TeamInviteForm({ organizationId }: { organizationId: string }) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"admin" | "viewer">("viewer");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/team/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    role,
                    organizationId
                })
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.error ?? "Failed to invite member");
            }

            toast.success(payload.message ?? "Invite sent");
            setEmail("");
            setRole("viewer");
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Could not invite member";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-[1fr_200px_auto] md:items-end">
            <div className="space-y-2">
                <Label htmlFor="invite-email" className="font-black uppercase text-xs">Member email</Label>
                <Input
                    id="invite-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teammate@example.com"
                    className="border-2 border-foreground rounded-none font-bold bg-white focus-visible:ring-0 placeholder:text-foreground/30 h-12"
                />
            </div>
            <div className="space-y-2">
                <Label className="font-black uppercase text-xs">Role</Label>
                <Select value={role} onValueChange={(value: "admin" | "viewer") => setRole(value)}>
                    <SelectTrigger className="border-2 border-foreground rounded-none font-bold bg-white focus:ring-0 h-12">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-foreground rounded-none shadow-[4px_4px_0px_0px_#14110d]">
                        <SelectItem value="viewer" className="font-bold hover:bg-secondary/20 rounded-none cursor-pointer">Viewer</SelectItem>
                        <SelectItem value="admin" className="font-bold hover:bg-secondary/20 rounded-none cursor-pointer">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button 
                type="submit" 
                className="bg-primary text-primary-foreground border-2 border-foreground font-black uppercase rounded-none shadow-[4px_4px_0px_0px_#14110d] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all h-12 px-8" 
                disabled={loading}
            >
                {loading ? "Inviting..." : "Invite Member"}
            </Button>
        </form>
    );
}
