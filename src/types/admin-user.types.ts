/**
 * Role definition to ensure consistency across the app
 */
export type UserRole = "admin" | "staff";

export interface User {
  id: number;
  f_name: string;
  l_name: string;
  email: string;
  username: string;
  password?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserInput {
  f_name: string;
  l_name: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
}

// MAKE SURE THIS IS EXPORTED
export interface ActionResponse {
  success: boolean;
  user?: User;
  error?: string;
}
