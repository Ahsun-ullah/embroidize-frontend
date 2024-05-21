/* eslint-disable react/no-unescaped-entities */
"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Login = () => {
  return (
    <>
      <div className="auth-page-wrapper auth-bg-cover pt-5 pb-2 d-flex justify-content-center align-items-center min-vh-100">
        <div className="bg-overlay "></div>
        {/* <!-- auth-page content --> */}
        <div className="auth-page-content overflow-hidden pt-lg-5">
          <div className="container p-3">
            <div className="row pt-1">
              <div className="col-lg-12 fs-2 ">
                <div className="card overflow-hidden border-0">
                  <div className="row justify-content-center g-0">
                    <div className="col-lg-6">
                      <div className="p-lg-5 p-4 auth-one-bg h-100">
                        <div className="bg-overlay-login"></div>
                        <div className="position-relative h-100 d-flex flex-column">
                          <div className="mb-4">
                            <Link href="/" className="d-block">
                              <Image
                                priority={true}
                                src={"/category.jpg"}
                                height={50}
                                width={60}
                                alt=""
                              />
                            </Link>
                          </div>
                          <div className="mt-auto">
                            <div className="mb-3">
                              <i className="ri-double-quotes-l display-1 qoute_color"></i>
                            </div>

                            <div
                              id="carouselExampleCaptions"
                              className="carousel slide"
                              data-bs-ride="carousel"
                            >
                              <div className="carousel-indicators">
                                <button
                                  type="button"
                                  data-bs-target="#carouselExampleCaptions"
                                  data-bs-slide-to="0"
                                  className="active"
                                  aria-current="true"
                                  aria-label="Slide 1"
                                ></button>
                                <button
                                  type="button"
                                  data-bs-target="#carouselExampleCaptions"
                                  data-bs-slide-to="1"
                                  aria-label="Slide 2"
                                ></button>
                                <button
                                  type="button"
                                  data-bs-target="#carouselExampleCaptions"
                                  data-bs-slide-to="2"
                                  aria-label="Slide 3"
                                ></button>
                              </div>
                              <div className="carousel-inner text-center text-white-50 pb-5">
                                <div className="carousel-item active">
                                  <p className="fs-15 fst-italic">
                                    " Great! Clean code, clean design, easy for
                                    customization. Thanks very much! "
                                  </p>
                                </div>
                                <div className="carousel-item">
                                  <p className="fs-15 fst-italic">
                                    " The theme is really great with an amazing
                                    customer support. Thanks very much!"
                                  </p>
                                </div>
                                <div className="carousel-item">
                                  <p className="fs-15 fst-italic">
                                    " Great! Clean code, clean design, easy for
                                    customization. Thanks very much! "
                                  </p>
                                </div>
                              </div>
                            </div>
                            {/* <!-- end carousel --> */}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* <!-- end col --> */}

                    <div className="col-lg-6">
                      <div className="p-lg-5 p-4">
                        <div>
                          <h5 className=" fs-1 fw-bold">Welcome !</h5>
                          <p className="text-muted fs-3">
                            Sign in to continue to EmbroiD.
                          </p>
                        </div>

                        <div className="mt-4">
                          <form onSubmit={"handleSubmit"}>
                            <div className="mb-3  pb-3">
                              <label
                                htmlFor="username"
                                className="form-label fs-2 pb-2"
                              >
                                User Email
                              </label>
                              <input
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                className="form-control fs-3 p-3"
                                placeholder="Enter Your Email"
                              />
                              {/* {error && (
                                <div className="text-danger text-center">
                                  {error}
                                </div>
                              )} */}
                            </div>
                            <div className="mb-3">
                              <div className="float-end ">
                                <div
                                  style={{ cursor: "pointer" }}
                                  onClick={() => togOpenModal()}
                                  className="text-muted text-primary fw-semibold text-decoration-underline "
                                >
                                  Forgot password?
                                </div>
                              </div>
                              <label
                                className="form-label fs-2 mb-2"
                                htmlFor="password-input"
                              >
                                Password
                              </label>
                              <div className="position-relative auth-pass-inputgroup">
                                <input
                                  onChange={(e) => handleChange(e)}
                                  // type={passwordShow ? "text" : "password"}
                                  className="form-control password-input fs-3 p-3 mb-2"
                                  // onPaste={handlePaste}
                                  placeholder="Enter password"
                                  aria-describedby="passwordInput"
                                  // pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                  required
                                />
                                <button
                                  className="position-absolute end-0 top-0 pt-3 fs-2 text-decoration-none text-muted password-addon p-3"
                                  type="button"
                                  // onClick={() => setPasswordShow(!passwordShow)}
                                  style={{ backgroundColor: "transparent" }}
                                >
                                  <i
                                  // className={`${
                                  //   passwordShow
                                  //     ? "ri-eye-off-line align-middle"
                                  //     : "ri-eye-fill align-middle"
                                  // }`}
                                  ></i>
                                </button>
                              </div>
                            </div>

                            {/* <div className="form-check py-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  value=""
                                  id="auth-remember-check"
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="auth-remember-check"
                                >
                                  Remember me
                                </label>
                              </div> */}

                            <div className="mt-4 ">
                              <input
                                // disabled={
                                //   loginIsLoading || getSubdomainIsLoading
                                // }
                                type="submit"
                                value="Sign In"
                                className="btn button text-light w-100 fs-2"
                              />
                            </div>
                          </form>
                        </div>

                        <div className="mt-5 fs-2 text-center">
                          <p className="mb-0">
                            Don't have an account ?{" "}
                            <Link
                              href="/auth/register"
                              className="fw-semibold text-primary text-decoration-underline"
                            >
                              {" "}
                              Signup
                            </Link>{" "}
                          </p>
                        </div>
                        <div className="mt-4 d-flex justify-content-center">
                          {/* <GoogleLogin
                            onSuccess={(credentialResponse) => {
                              handleGoogleLogin(credentialResponse);
                            }}
                            onError={() => {
                              console.log("Login Failed");
                            }}
                            auto_select={true}
                            useOneTap={true}
                          /> */}
                        </div>
                      </div>
                    </div>
                    {/* <!-- end col --> */}
                  </div>
                  {/* <!-- end row -->
                        </div> */}
                  {/* <!-- end card --> */}
                </div>
                {/* <!-- end col -->/ */}
              </div>
            </div>
          </div>

          {/* <!-- footer --> */}
          <footer className="text-light mt-5">
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className="text-center">
                    <p className="mb-0 fs-4">
                      &copy; {new Date().getFullYear()} EmbroiD. Crafted with{" "}
                      <i className="mdi mdi-heart text-danger"></i> by Ahsun
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </footer>
          {/* <!-- end Footer --> */}
        </div>
      </div>
    </>
  );
};

export default Login;
