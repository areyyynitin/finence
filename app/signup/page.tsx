'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authClient } from '@/src/lib/auth-client';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGoogleLogin = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/onboarding"
        });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await authClient.signUp.email({
                email,
                password,
                name,
                callbackURL: '/onboarding'
            });
            if (error) throw error;
            toast.success('Account created successfully');
            router.push('/onboarding');
        } catch (err: any) {
            toast.error(err.message || 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <div className="w-full max-w-md bg-white border-4 border-foreground shadow-[12px_12px_0px_0px_#14110d] p-8 md:p-12 animate-in zoom-in-95 duration-500">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Sign Up</h1>
                    <p className="text-sm font-bold text-foreground/60 uppercase">Create an account to get started</p>
                </div>
                
                <div className="space-y-8">
                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="font-black uppercase text-xs">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border-2 border-foreground rounded-none font-bold bg-white focus-visible:ring-0 placeholder:text-foreground/30 h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-black uppercase text-xs">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border-2 border-foreground rounded-none font-bold bg-white focus-visible:ring-0 placeholder:text-foreground/30 h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="font-black uppercase text-xs">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border-2 border-foreground rounded-none font-bold bg-white focus-visible:ring-0 h-12"
                            />
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full bg-primary text-primary-foreground border-2 border-foreground font-black uppercase rounded-none shadow-[4px_4px_0px_0px_#14110d] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all h-14" 
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Sign Up'}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t-2 border-foreground"></span></div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4">Or join with</span></div>
                        </div>

                        <Button 
                            variant="outline" 
                            type="button"
                            className="w-full bg-white text-foreground border-2 border-foreground font-black uppercase rounded-none shadow-[4px_4px_0px_0px_#14110d] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all h-14" 
                            onClick={handleGoogleLogin}
                        >
                            Google
                        </Button>
                    </form>

                    <p className="text-center text-xs font-bold uppercase text-foreground/60">
                        Already have an account?{' '}
                        <a href="/login" className="text-foreground border-b-2 border-primary hover:bg-primary/10 transition-colors">Login</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
