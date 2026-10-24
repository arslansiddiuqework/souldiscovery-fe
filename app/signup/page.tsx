"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Mail, User, Lock, Eye, EyeOff } from "lucide-react";
import { registerUser, loginWithGoogle } from "@/lib/api/auth";
import { GoogleAuthSection } from "@/components/auth/google-auth-section";
import { useSession } from "@/lib/contexts/session-context";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND_NAME } from "@/lib/branding";

export default function SignupPage() {
  const router = useRouter();
  const { checkSession } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await registerUser(name, email, password);
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
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
        err instanceof Error ? err.message : "Google signup failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center px-4 pt-28 pb-12 md:pt-32 md:pb-16">
      <Container className="relative z-10 flex w-full flex-col items-center justify-center">
        <Card className="glass-panel-light w-full max-w-lg rounded-[22px] border-[#EADCE5] p-6 md:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex justify-center">
              <BrandLogo variant="stacked" size={64} priority />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#49263D] md:text-4xl">
              Create your account
            </h1>
            <p className="mt-2 text-base text-[#927C8B]">
              Start your journey with {BRAND_NAME} today
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[#49263D]">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927C8B]" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      className="pl-11"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#49263D]">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927C8B]" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email"
                      className="pl-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
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
                    placeholder="Create a password"
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

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-[#49263D]">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927C8B]" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="pl-11 pr-11"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#927C8B] transition-colors hover:text-[#D9B8F5]"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>

          <GoogleAuthSection
            onSuccess={handleGoogleSuccess}
            onError={setError}
            text="Continue with Google"
            disabled={loading}
          />

          <div className="mt-8 border-t border-[#EADCE5] pt-6">
            <p className="text-center text-sm text-[#927C8B]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#B47BCF] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </Container>
    </div>
  );
}
