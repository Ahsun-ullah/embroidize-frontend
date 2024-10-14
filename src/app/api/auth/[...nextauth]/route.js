import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "../../../../lib/connectDB";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const db = await connectDB();
        const userCollection = db.collection("users");

        // Find user by email
        const user = await userCollection.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("No user found with this email");
        }

        // Validate password
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValidPassword) {
          throw new Error("Invalid password");
        }

        // Return user data
        return {
          id: user._id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login", // Custom sign-in page
    error: "/auth/error",   // Error page
  },
  session: {
    strategy: "jwt", // Use JWT for session management
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for JWT
  callbacks: {
    async jwt({ token, user }) {
      // Add user info to the token
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info to the session
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
