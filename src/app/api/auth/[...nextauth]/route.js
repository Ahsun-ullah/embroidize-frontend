import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter Your Email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter Your Password",
        },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        if (!credentials) return null;

        if (email) {
          console.log(email);
        }
        if (password) {
          console.log(password);
        }

        return true;
      },
    }),
  ],
});

export { handler as GET, handler as POST };
