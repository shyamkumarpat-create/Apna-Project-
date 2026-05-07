"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { useToast } from "@/components/ui/use-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: { role: "BUYER" },
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      toast({ title: "Registration failed", description: err.error, variant: "destructive" });
      setLoading(false);
      return;
    }

    await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    toast({ title: "Welcome! 🎉", description: "You've earned 50 points for joining!", variant: "default" });
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join Apna Project and earn 50 welcome points!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Rahul Sharma" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>I am a</Label>
              <Select onValueChange={(v) => setValue("role", v as "BUYER" | "SELLER")} defaultValue="BUYER">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUYER">Buyer / Tenant</SelectItem>
                  <SelectItem value="SELLER">Seller / Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
