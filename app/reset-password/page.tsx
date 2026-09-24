"use client";

import { useState, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api/auth";
import { BrandLogo } from "@/components/brand-logo";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center py-24">
      <Container className="relative z-10 flex w-full flex-col items-center justify-center">
        <Card className="glass-panel-light w-full max-w-md rounded-[22px] border-[rgba(216,191,227,0.22)] p-8 md:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex justify-center">
              <BrandLogo variant="stacked" size={64} priority />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#f3eefa]">
              Reset password
            </h1>
            <p className="mt-2 text-base text-[rgba(231,218,237,0.55)]">
              Enter your new password below
            </p>
          </div>

          {success ? (
            <div className="rounded-[16px] border border-success/30 bg-success/10 px-6 py-8 text-center">
              <p className="mb-3 text-lg font-semibold text-success">
                Password reset successful!
              </p>
              <Link href="/login" className="font-semibold text-[#d8bfe3] hover:underline">
                Sign in
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#f3eefa]">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(231,218,237,0.4)]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="pl-11 pr-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(231,218,237,0.4)] transition-colors hover:text-[#d8bfe3]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-[#f3eefa]">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(231,218,237,0.4)]" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="pl-11 pr-11"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(231,218,237,0.4)] transition-colors hover:text-[#d8bfe3]"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm font-medium text-destructive">
                  {error}
                </div>
              )}
              <Button className="w-full" size="lg" type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="mt-8 border-t border-[rgba(216,191,227,0.18)] pt-6">
            <p className="text-center text-sm text-[rgba(231,218,237,0.55)]">
              Remembered your password?{" "}
              <Link href="/login" className="font-semibold text-[#d8bfe3] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </Container>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-screen w-full items-center justify-center">
          <p className="relative z-10 text-[rgba(231,218,237,0.55)]">Loading...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
