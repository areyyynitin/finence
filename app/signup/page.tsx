'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md border-slate-200 shadow-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-semibold tracking-tight">Create an account</CardTitle>
                    <CardDescription>Enter your details to get started</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800" disabled={loading}>
                            {loading ? 'Creating account...' : 'Sign up'}
                        </Button>

                        <Button variant="outline" className="w-full text-white border-slate-200" onClick={handleGoogleLogin}>
                            Google
                        </Button>
                    </form>
                    <p className="text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <a href="/login" className="font-medium text-slate-900 hover:underline">Login</a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
