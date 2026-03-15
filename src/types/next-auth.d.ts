import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole; // Define it here
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole; // Define it here too
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
