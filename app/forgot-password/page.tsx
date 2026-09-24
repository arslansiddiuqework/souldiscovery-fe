"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Mail } from "lucide-react";
import { forgotPassword } from "@/lib/api/auth";
import { BrandLogo } from "@/components/brand-logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send reset link. Please try again."
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
              Forgot password
            </h1>
            <p className="mt-2 text-base text-[rgba(231,218,237,0.55)]">
              Enter your email to receive a password reset link
            </p>
          </div>

          {submitted ? (
            <div className="rounded-[16px] border border-success/30 bg-success/10 px-6 py-8 text-center">
              <p className="mb-2 text-lg font-semibold text-success">Check your email!</p>
              <p className="text-sm text-[rgba(231,218,237,0.55)]">
                If an account exists, a reset link has been sent.
              </p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#f3eefa]">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(231,218,237,0.4)]" />
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
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm font-medium text-destructive">
                  {error}
                </div>
              )}
              <Button className="w-full" size="lg" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
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
