"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, loginWithGoogle } from "@/lib/api/auth";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";
import { BrandLogo } from "@/components/brand-logo";

export default function LoginPage() {
  const router = useRouter();
  const { checkSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await loginUser(email, password);
      localStorage.setItem("token", response.token);
      await checkSession();
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (accessToken: string) => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const response = await loginWithGoogle(accessToken);
      localStorage.setItem("token", response.token);
      await checkSession();
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Google login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center px-4 pt-28 pb-12 md:pt-32 md:pb-16">
      <Container className="relative z-10 flex w-full flex-col items-center justify-center">
        <Card className="glass-panel-light w-full max-w-md rounded-[22px] border-[#EADCE5] p-6 md:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex justify-center">
              <BrandLogo variant="stacked" size={64} priority />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#49263D] md:text-4xl">
              Welcome back
            </h1>
            <p className="mt-2 text-base text-[#927C8B]">
              Sign in to continue your wellness journey
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#49263D]">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927C8B]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#49263D]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927C8B]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-11 pr-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#927C8B] transition-colors hover:text-[#D9B8F5]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <Button className="w-full" size="lg" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ? (
            <div className="mt-6 flex w-full flex-col items-center justify-center gap-4">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#EADCE5]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wide">
                  <span className="bg-white px-3 text-[#927C8B]">Or continue with</span>
                </div>
              </div>
              <div className="w-full pt-1">
                <GoogleButton
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google login failed. Please try again.")}
                  text="Continue with Google"
                />
              </div>
            </div>
          ) : null}

          <div className="mt-8 border-t border-[#EADCE5] pt-6">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
              <span className="text-[#927C8B]">Don&apos;t have an account?</span>
              <Link href="/signup" className="font-semibold text-[#D9B8F5] hover:underline">
                Sign up
              </Link>
              <span className="text-[#795A70]">·</span>
              <Link href="/forgot-password" className="font-medium text-[#D9B8F5] hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
