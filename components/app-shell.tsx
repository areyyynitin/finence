'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/src/lib/auth-client'
import { useOrgStore } from './store/use-org-store';
import { useEffect } from "react";
import {
    LayoutDashboard,
    ArrowLeftRight,
    Building2,
    Users,
    Settings,
    LogOut,
    ChevronDown,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppUser {
    name?: string | null;
    image?: string | null;
}

interface AppOrganization {
    id: string;
    name: string;
}

interface AppShellProps {
    children: React.ReactNode;
    user: AppUser;
    organizations: AppOrganization[];
}

export function AppShell({ children, user, organizations }: AppShellProps) {
    const pathname = usePathname();
    const { currentOrgId, setCurrentOrgId, setTransactionModalOpen } = useOrgStore();

    useEffect(() => {
        if (!currentOrgId && organizations.length > 0) {
            setCurrentOrgId(organizations[0].id);
        }
    }, [currentOrgId, organizations, setCurrentOrgId]);

    const currentOrg = organizations.find(o => o.id === currentOrgId) || organizations[0];

    const routes = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
        { name: 'Organizations', href: '/organizations', icon: Building2 },
        { name: 'Team Members', href: '/team', icon: Users },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen w-full bg-slate-50 text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 animate-in fade-in duration-500">
                <div className="p-6 flex items-center gap-3 border-b border-slate-100">
                    {/* <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
                    </div> */}
                    <span className="font-semibold text-lg tracking-tight">Finence</span>
                </div>

                {/* Org Selector */}
                <div className="px-4 py-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Organization</span>
                                    <span className="text-sm font-medium truncate max-w-[120px]">{currentOrg?.name || 'Select Org'}</span>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start">
                            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {organizations.map(org => (
                                <DropdownMenuItem key={org.id} onClick={() => setCurrentOrgId(org.id)}>
                                    {org.name}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/onboarding" className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Create New
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-2 space-y-1">
                    {routes.map((route) => {
                        const Icon = route.icon;
                        const isActive = pathname === route.href;
                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
                                {route.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-slate-100">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors">
                                <Avatar className="w-8 h-8">
                                    {/* <AvatarImage src={user?.image} /> */}
                                    <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-sm font-medium truncate">{user?.name}</span>
                                    <span className="text-xs text-slate-500 truncate">Admin</span>
                                </div>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start">
                            <DropdownMenuItem
                                onClick={async () => {
                                    await authClient.signOut({
                                        fetchOptions: {
                                            onSuccess: () => {
                                                window.location.href = "/login"; // or use your router, e.g., router.push("/login")
                                            }
                                        }
                                    });
                                }}
                            >
                                <LogOut className="w-4 h-4 mr-2" /> Logout
                            </DropdownMenuItem>

                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <header className="sticky top-0 z-10 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 flex-shrink-0">
                    <h1 className="text-lg font-semibold capitalize">
                        {pathname.split('/').pop() || 'Overview'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" className="hidden sm:flex border-slate-200 text-white" asChild>
                            <Link href="/team">Invite Member</Link>
                        </Button>
                        <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => setTransactionModalOpen(true)}>
                            + Add Transaction
                        </Button>
                    </div>
                </header>

                <div className="p-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
