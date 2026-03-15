export type UserRole = "admin" | "responder" | "volunteer" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Extend NextAuth session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
    };
  }
  interface User {
    role: UserRole;
  }
}

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
  }
}

export type Users = {
  id: string;
  name: string | null;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  role: string;
};
