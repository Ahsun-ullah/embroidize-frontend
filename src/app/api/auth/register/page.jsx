/* eslint-disable react/no-unescaped-entities */
"use client";
import { Card, CardBody, CardHeader, Input } from "@nextui-org/react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "../../../../components/HomePage/Header";

const Register = () => {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const newUser = {
      name: e.target.username.value,
      email: e.target.email.value,
      password: e.target.password.value,
    };

    try {
      const response = await fetch("/api/auth/register/new-user", {
        method: "POST",
        body: JSON.stringify(newUser),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const loginResponse = await signIn("credentials", {
          redirect: false,
          email: newUser.email,
          password: newUser.password,
        });

        if (!loginResponse.error) {
        } else {
          setError("Login failed after registration.");
        }
      } else {
        const result = await response.json();
        setError(result.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error); 
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col h-screen items-center justify-center gap-10 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md p-6 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3">
          <CardHeader className="flex flex-col items-start">
            <h4 className="font-bold text-xl mb-3">Hello!</h4>
            <p className="text-sm uppercase font-bold">
              Please fill all fields for registration.
            </p>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="form-label">
                  User Name
                </label>
                <Input
                  type="text"
                  name="username"
                  className="form-control mt-2"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  className="form-control mt-2"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="form-label" htmlFor="password-input">
                  Password
                </label>
                <Input
                  type="password"
                  name="password"
                  className="form-control password-input mt-2"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div>
                <input
                  type="submit"
                  value="Register"
                  className="button bg-blue-500 hover:bg-blue-600 text-white w-full py-2 rounded-md"
                />
              </div>
            </form>

            <div className="mt-5 text-center">
              <p className="mb-0">
                Already have an account?
                <Link
                  href="/api/auth/login"
                  className="font-semibold ms-1 text-blue-500 underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
        <div className="text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} EmbroiD. Crafted with{" "}
            <i className="mdi mdi-heart text-red-500"></i> by Ahsun
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
