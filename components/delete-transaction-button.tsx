"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteTransactionButtonProps {
    transactionId: string;
}

export function DeleteTransactionButton({ transactionId }: DeleteTransactionButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/transaction/${transactionId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to delete transaction");
            }

            toast.success("Transaction deleted successfully");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="border-2 border-transparent hover:border-foreground hover:bg-red-50 hover:text-red-600 transition-all rounded-none">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-4 border-foreground shadow-[8px_8px_0px_0px_#14110d] rounded-none bg-background">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-black uppercase text-xl tracking-tight">Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="font-bold text-foreground/70 uppercase text-xs">
                        This action cannot be undone. This will permanently delete the transaction record.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel disabled={isDeleting} className="border-2 border-foreground font-black uppercase rounded-none hover:bg-secondary/10">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={isDeleting}
                        className="bg-red-600 text-white border-2 border-foreground font-black uppercase rounded-none shadow-[4px_4px_0px_0px_#14110d] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
