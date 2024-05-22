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
import React from "react";

const Login = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-1/4 p-4">
        <CardHeader className="flex flex-col items-start">
          <h4 className="font-bold text-lg">Welcome!</h4>
          <p className="text-sm uppercase font-bold">
            Sign in to continue to EmbroiD.
          </p>
        </CardHeader>
        <CardBody className="overflow-visible py-2">
          <form onSubmit={"handleSubmit"}>
            <div className="mb-4">
              <label htmlFor="username" className="form-label">
                User Email
              </label>
              <Input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="form-control"
                placeholder="Enter Your Email"
              />
            </div>
            <div className="mb-4">
              <div className="float-right">
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => togOpenModal()}
                  className="text-muted text-primary font-semibold underline"
                >
                  Forgot password?
                </div>
              </div>
              <label className="form-label" htmlFor="password-input">
                Password
              </label>
              <div className="position-relative auth-pass-inputgroup">
                <Input
                  onChange={(e) => handleChange(e)}
                  className="form-control password-input"
                  placeholder="Enter password"
                  aria-describedby="passwordInput"
                  required
                />
                <button
                  className="position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
                  type="button"
                  style={{ backgroundColor: "transparent" }}
                >
                  <i></i>
                </button>
              </div>
            </div>

            <div className="mt-4">
              <input
                type="submit"
                value="Sign In"
                className="btn button text-light w-full"
              />
            </div>
          </form>

          <div className="mt-5 text-center">
            <p className="mb-0">
              Don't have an account?
              <Link
                href="/auth/register"
                className="font-semibold ms-1 text-primary underline"
              >
                Signup
              </Link>
            </p>
          </div>
        </CardBody>
        <CardFooter>
          <div className="text-center">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} EmbroiD. Crafted with{" "}
              <i className="mdi mdi-heart text-danger"></i> by Ahsun
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
