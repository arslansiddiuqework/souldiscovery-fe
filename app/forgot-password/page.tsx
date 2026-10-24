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
    <div className="relative flex min-h-screen w-full items-center justify-center px-4 pt-28 pb-12 md:pt-32 md:pb-16">
      <Container className="relative z-10 flex w-full flex-col items-center justify-center">
        <Card className="glass-panel-light w-full max-w-md rounded-[22px] border-[#EADCE5] p-6 md:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex justify-center">
              <BrandLogo variant="stacked" size={64} priority />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#49263D]">
              Forgot password
            </h1>
            <p className="mt-2 text-base text-[#927C8B]">
              Enter your email to receive a password reset link
            </p>
          </div>

          {submitted ? (
            <div className="rounded-[16px] border border-success/30 bg-success/10 px-6 py-8 text-center">
              <p className="mb-2 text-lg font-semibold text-success">Check your email!</p>
              <p className="text-sm text-[#927C8B]">
                If an account exists, a reset link has been sent.
              </p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
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

          <div className="mt-8 border-t border-[#EADCE5] pt-6">
            <p className="text-center text-sm text-[#927C8B]">
              Remembered your password?{" "}
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
