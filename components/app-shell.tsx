'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/src/lib/auth-client'
import { useOrgStore } from './store/use-org-store';
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    ArrowLeftRight,
    Building2,
    Users,
    Settings,
    LogOut,
    ChevronDown,
    Plus,
    Menu,
    X
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-background border-r-2 border-foreground">
            <div className="p-6 flex items-center justify-between border-b-2 border-foreground bg-primary/10">
                <span className="font-black text-2xl uppercase tracking-tighter">Finence</span>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden border-2 border-foreground" 
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <X className="w-6 h-6" />
                </Button>
            </div>

            {/* Org Selector */}
            <div className="px-4 py-4 border-b-2 border-foreground bg-secondary/10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="bg-white border-2 border-foreground p-3 flex items-center justify-between cursor-pointer shadow-[2px_2px_0px_0px_#14110d] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black text-foreground/60 tracking-wider">Organization</span>
                                <span className="text-sm font-bold truncate max-w-[120px]">{currentOrg?.name || 'Select Org'}</span>
                            </div>
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 border-2 border-foreground shadow-[4px_4px_0px_0px_#14110d] rounded-none" align="start">
                        <DropdownMenuLabel className="uppercase font-black">Organizations</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-foreground h-[2px]" />
                        {organizations.map(org => (
                            <DropdownMenuItem 
                                key={org.id} 
                                onClick={() => setCurrentOrgId(org.id)}
                                className="font-bold hover:bg-secondary/20 rounded-none cursor-pointer"
                            >
                                {org.name}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator className="bg-foreground h-[2px]" />
                        <DropdownMenuItem asChild className="rounded-none cursor-pointer">
                            <Link href="/onboarding" className="flex items-center gap-2 font-bold uppercase text-xs">
                                <Plus className="w-4 h-4" /> Create New
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {routes.map((route) => {
                    const Icon = route.icon;
                    const isActive = pathname === route.href;
                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-sm font-black uppercase tracking-tight border-2 transition-all",
                                isActive
                                    ? "bg-primary text-primary-foreground border-foreground shadow-[4px_4px_0px_0px_#14110d]"
                                    : "bg-white border-foreground text-foreground hover:bg-secondary/10 hover:shadow-[2px_2px_0px_0px_#14110d]"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {route.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t-2 border-foreground bg-accent/10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-3 px-3 py-3 border-2 border-foreground bg-white cursor-pointer shadow-[2px_2px_0px_0px_#14110d] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                            <Avatar className="w-8 h-8 border-2 border-foreground rounded-none">
                                <AvatarFallback className="rounded-none font-black bg-secondary">{user?.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm font-black uppercase truncate leading-none">{user?.name}</span>
                                <span className="text-[10px] font-bold text-foreground/60 uppercase">Admin</span>
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 border-2 border-foreground shadow-[4px_4px_0px_0px_#14110d] rounded-none" align="start">
                        <DropdownMenuItem
                            className="font-black uppercase text-sm rounded-none cursor-pointer text-red-600 hover:bg-red-50"
                            onClick={async () => {
                                await authClient.signOut({
                                    fetchOptions: {
                                        onSuccess: () => {
                                            window.location.href = "/login";
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
        </div>
    );

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-72 animate-in slide-in-from-left duration-300">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
                <header className="sticky top-0 z-40 h-20 border-b-2 border-foreground bg-background/95 backdrop-blur-sm flex items-center justify-between px-6 lg:px-10 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="lg:hidden border-2 border-foreground shadow-[2px_2px_0px_0px_#14110d]" 
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                        <h1 className="text-xl lg:text-3xl font-black uppercase tracking-tighter">
                            {pathname.split('/').pop() || 'Overview'}
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button 
                            className="hidden md:flex bg-secondary text-foreground border-2 border-foreground font-black uppercase shadow-[4px_4px_0px_0px_#14110d] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all rounded-none" 
                            asChild
                        >
                            <Link href="/team">Invite</Link>
                        </Button>
                        <Button 
                            className="bg-primary text-primary-foreground border-2 border-foreground font-black uppercase shadow-[4px_4px_0px_0px_#14110d] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all rounded-none" 
                            onClick={() => setTransactionModalOpen(true)}
                        >
                            <Plus className="w-5 h-5 mr-1" /> <span className="hidden sm:inline">Transaction</span>
                        </Button>
                    </div>
                </header>

                <div className="p-6 lg:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </div>
            </main>
        </div>
    );
}
