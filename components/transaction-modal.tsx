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
            <DialogContent className="sm:max-w-[425px] border-4 border-foreground shadow-[8px_8px_0px_0px_#14110d] rounded-none bg-background p-8">
                <DialogHeader>
                    <DialogTitle className="font-black uppercase text-2xl tracking-tight">Add Transaction</DialogTitle>
                    <DialogDescription className="font-bold text-foreground/60 uppercase text-xs">Record a new income or expense for your organization.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-black uppercase text-xs">Type</Label>
                            <Select value={type} onValueChange={(v: 'income' | 'expense') => setType(v)}>
                                <SelectTrigger className="border-2 border-foreground rounded-none font-bold bg-white focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-foreground rounded-none shadow-[4px_4px_0px_0px_#14110d]">
                                    <SelectItem value="income" className="font-bold hover:bg-secondary/20 rounded-none">Income</SelectItem>
                                    <SelectItem value="expense" className="font-bold hover:bg-secondary/20 rounded-none">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black uppercase text-xs">Amount (₹)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                required
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="border-2 border-foreground rounded-none font-bold bg-white focus-visible:ring-0 placeholder:text-foreground/30"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-black uppercase text-xs">Date</Label>
                        <Input
                            type="date"
                            required
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="border-2 border-foreground rounded-none font-bold bg-white focus-visible:ring-0"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="font-black uppercase text-xs">Description</Label>
                        <Input
                            placeholder="Product sale, Rent, etc."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="border-2 border-foreground rounded-none font-bold bg-white focus-visible:ring-0 placeholder:text-foreground/30"
                        />
                    </div>

                    {type === 'income' ? (
                        <>
                            <div className="space-y-2">
                                <Label className="font-black uppercase text-xs">Payer Name</Label>
                                <Input
                                    placeholder="Client name"
                                    required
                                    value={payerName}
                                    onChange={e => setPayerName(e.target.value)}
                                    className="border-2 border-foreground rounded-none font-bold bg-white focus-visible:ring-0 placeholder:text-foreground/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-black uppercase text-xs">Payer Email</Label>
                                <Input
                                    type="email"
                                    placeholder="client@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="border-2 border-foreground rounded-none font-bold bg-white focus-visible:ring-0 placeholder:text-foreground/30"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <Label className="font-black uppercase text-xs">Reason</Label>
                            <Input
                                placeholder="Office supplies, Salary..."
                                required
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                className="border-2 border-foreground rounded-none font-bold bg-white focus-visible:ring-0 placeholder:text-foreground/30"
                            />
                        </div>
                    )}

                    <DialogFooter className="pt-4">
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground border-2 border-foreground font-black uppercase rounded-none shadow-[4px_4px_0px_0px_#14110d] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all py-6"
                        >
                            {loading ? 'Saving...' : 'Save Transaction'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
