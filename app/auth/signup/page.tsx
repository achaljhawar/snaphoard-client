"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthCredentialsValidator } from "@/schema/usermodels";
import styled from "@emotion/styled";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast, Toaster } from "react-hot-toast";
const backendUrl = process.env.NEXT_PUBLIC_BACKEND || "http://localhost:5000";
export default function LoginPage() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (token !== null && token !== undefined) {
          const response = await fetch(backendUrl + "/api/checkauth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            setLoggedIn(true);
          } else {
            sessionStorage.removeItem("token");
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkAuth();
  }, [loggedIn]);
  if (loggedIn) {
    return null; 
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <LoginForm />
    </div>
  );
}

const ErrorMessage = styled.p`
  font-size: 0.75rem;
  color: #dc2626;
`;

function LoginForm() {
  type TAuthCredentialValidator = z.infer<typeof AuthCredentialsValidator>;
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAuthCredentialValidator>({
    resolver: zodResolver(AuthCredentialsValidator),
  });

  const onSubmit = async (data: TAuthCredentialValidator) => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND || "http://localhost:5000";
      const response = await fetch(backendUrl + "/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(
          "Form submitted successfully. Check your email to verify your account."
        );
      } else {
        toast.error("Error submitting form. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Card className="mx-auto max-w-sm gap-2 -mt-20">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    placeholder="Gavin"
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <ErrorMessage>{errors.firstName.message}</ErrorMessage>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Belson"
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <ErrorMessage>{errors.lastName.message}</ErrorMessage>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="gavinbelson"
                  {...register("username")}
                />
                {errors.username && (
                  <ErrorMessage>{errors.username.message}</ErrorMessage>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="gavin@hooli.com"
                  {...register("email")}
                />
                {errors.email && (
                  <ErrorMessage>{errors.email.message}</ErrorMessage>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="piedpipersucks"
                  {...register("password")}
                />
                {errors.password && (
                  <ErrorMessage>{errors.password.message}</ErrorMessage>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Controller
                  name="role" // Specify the field name
                  control={control} // Pass the 'control' object
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange} // Handle value changes
                      value={field.value} // Set the current value
                    >
                      <SelectTrigger className="w-[350px]">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                        <SelectItem value="Poster">Poster</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <ErrorMessage>{errors.role.message}</ErrorMessage>
                )}
              </div>
              <Button type="submit" className="w-full">
                Create an account
              </Button>
              <Button variant="outline" className="w-full">
                Sign up with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/signin" className="underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
