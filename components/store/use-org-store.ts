import { create } from "zustand";

interface OrgState {
    currentOrgId: string | null;
    setCurrentOrgId: (id: string | null) => void;
    isInviteModalOpen: boolean;
    setInviteModalOpen: (open: boolean) => void;
    isTransactionModalOpen: boolean;
    setTransactionModalOpen: (open: boolean) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
    currentOrgId: null,
    setCurrentOrgId: (id) => set({ currentOrgId: id }),
    isInviteModalOpen: false,
    setInviteModalOpen: (open) => set({ isInviteModalOpen: open }),
    isTransactionModalOpen: false,
    setTransactionModalOpen: (open) => set({ isTransactionModalOpen: open }),
}));
