'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/src/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await authClient.signIn.email({
                email,
                password,
                callbackURL: '/onboarding'
            });
            if (error) throw error;
            toast.success('Logged in successfully');
            router.push('/onboarding');
        } catch (err: any) {
            toast.error(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/onboarding"
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md border-slate-200 shadow-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-semibold tracking-tight">Login</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
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
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500">Or continue with</span></div>
                    </div>
                    <Button variant="outline" className="w-full text-white border-slate-200" onClick={handleGoogleLogin}>
                        Google
                    </Button>
                    <p className="text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <a href="/signup" className="font-medium text-slate-900 hover:underline">Sign up</a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
