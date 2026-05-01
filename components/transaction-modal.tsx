'use client';

import { useOrgStore } from "@/components/store/use-org-store"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";

export function TransactionModal() {
    const { isTransactionModalOpen, setTransactionModalOpen, currentOrgId } = useOrgStore();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [type, setType] = useState<'income' | 'expense'>('income');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Income specific
    const [payerName, setPayerName] = useState('');
    const [email, setEmail] = useState('');

    // Expense specific
    const [reason, setReason] = useState('');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentOrgId) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/transaction`, {
                method: 'POST',
                body: JSON.stringify({
                    type,
                    amount: parseFloat(amount),
                    description,
                    category: null,
                    date: new Date(date),
                    organizationId: currentOrgId,
                    payerName: type === 'income' ? payerName : null,
                    email: type === 'income' ? email : null,
                    reason: type === 'expense' ? reason : null,
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) throw new Error('Failed to save transaction');

            toast.success('Transaction added');
            setTransactionModalOpen(false);
            router.refresh();

            // Reset form
            setAmount('');
            setDescription('');
            setPayerName('');
            setEmail('');
            setReason('');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to save transaction";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isTransactionModalOpen} onOpenChange={setTransactionModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogDescription>Record a new income or expense for your organization.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={type} onValueChange={(v: 'income' | 'expense') => setType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="income">Income</SelectItem>
                                    <SelectItem value="expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Amount (₹)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                required
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                            type="date"
                            required
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            placeholder="Product sale, Rent, etc."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    {type === 'income' ? (
                        <>
                            <div className="space-y-2">
                                <Label>Payer Name</Label>
                                <Input
                                    placeholder="Client name"
                                    required
                                    value={payerName}
                                    onChange={e => setPayerName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Payer Email (for confirmation)</Label>
                                <Input
                                    type="email"
                                    placeholder="client@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Input
                                placeholder="Office supplies, Salary..."
                                required
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="submit" className="bg-slate-900" >
                            {loading ? 'Saving...' : 'Save Transaction'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
