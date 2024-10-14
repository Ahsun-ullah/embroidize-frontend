/* eslint-disable react/no-unescaped-entities */
"use client";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
} from "@nextui-org/react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "../../../../components/HomePage/Header";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state on submit

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res.ok) {
      router.push("/"); // Redirect to home on successful login
    } else {
      setError("Invalid credentials. Please try again."); // Set error message
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col h-screen items-center justify-center gap-10 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md p-6 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3">
          <CardHeader className="flex flex-col items-start">
            <h4 className="font-bold text-xl mb-3">Welcome!</h4>
            <p className="text-sm uppercase font-bold">
              Sign in to continue to EmbroiD.
            </p>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="form-label">
                  User Email
                </label>
                <Input
                  type="email"
                  className="form-control mt-2"
                  placeholder="Enter Your Email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="form-label" htmlFor="password-input">
                  Password
                </label>
                <Input
                  type="password"
                  className="form-control password-input mt-2"
                  placeholder="Enter password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div>
                <input
                  type="submit"
                  value="Login"
                  className="button font-semibold w-full py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
                />
              </div>
            </form>
            <div className="mt-5 text-center">
              <p className="mb-0">
                Don't have an account?
                <Link
                  href="/api/auth/register"
                  className="font-semibold ml-1 text-blue-500 underline"
                >
                  Register
                </Link>
              </p>
            </div>
          </CardBody>
          <CardFooter className="flex justify-center">
            <button
              className="button flex items-center justify-center mx-auto hover:text-black font-bold"
              type="button"
              onClick={() => signIn("google")}
            >
              <i className="ri-google-fill me-2 text-3xl"></i> Sign In With
              Google
            </button>
          </CardFooter>
        </Card>
        <div className="text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} EmbroiD. Crafted{" "}
            <i className="mdi mdi-heart text-red-500"></i> by Ahsun
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
