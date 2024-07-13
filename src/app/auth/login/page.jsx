/* eslint-disable react/no-unescaped-entities */
"use client";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
} from "@nextui-org/react";
import Link from "next/link";
import Footer from "../../../components/HomePage/Footer";
import Header from "../../../components/HomePage/Header";
import { googleLogin } from "../../actions";

const Login = () => {
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
            <form onSubmit={"handleSubmit"}>
              <div className="mb-4">
                <label htmlFor="email" className="form-label">
                  User Email
                </label>
                <Input
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="form-control mt-2"
                  placeholder="Enter Your Email"
                />
              </div>
              <div className="mb-6">
                <div className="text-right">
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => togOpenModal()}
                    className="text-blue-500 font-semibold underline"
                  >
                    Forgot password?
                  </div>
                </div>
                <label className="form-label" htmlFor="password-input">
                  Password
                </label>
                <div className="relative">
                  <Input
                    onChange={(e) => handleChange(e)}
                    type="password"
                    className="form-control password-input mt-2"
                    placeholder="Enter password"
                    aria-describedby="passwordInput"
                    required
                  />
                  <button
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                    type="button"
                    style={{ backgroundColor: "transparent" }}
                  >
                    <i></i>
                  </button>
                </div>
              </div>

              <div>
                <input
                  type="submit"
                  value="Sign In"
                  className="button font-semibold w-full py-2 rounded-md"
                />
              </div>
            </form>

            <div className="mt-5 text-center">
              <p className="mb-0">
                Don't have an account?
                <Link
                  href="/auth/register"
                  className="font-semibold ml-1 text-blue-500 underline"
                >
                  Signup
                </Link>
              </p>
            </div>
          </CardBody>
          <CardFooter className="flex justify-center">
            <form action={googleLogin}>
              <button
                className="button flex items-center justify-center mx-auto  hover:text-black font-bolder"
                type="submit"
                name="action"
                value="google"
              >
                <i className="ri-google-fill  me-2 text-3xl "></i>
                Sign In With Google
              </button>
            </form>
          </CardFooter>
        </Card>
        <div className="text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} EmbroiD. Crafted with{" "}
            <i className="mdi mdi-heart text-red-500"></i> by Ahsun
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
