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
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-[1fr_160px_auto] md:items-end">
            <div className="space-y-2">
                <Label htmlFor="invite-email">Member email</Label>
                <Input
                    id="invite-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teammate@example.com"
                />
            </div>
            <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(value: "admin" | "viewer") => setRole(value)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800" disabled={loading}>
                {loading ? "Inviting..." : "Invite"}
            </Button>
        </form>
    );
}
