import { userRepository } from "../repositories/admin-user.repository";
import { CreateUserInput, User } from "@/types/admin-user.types";

export const userService = {
  /**
   * Logic for registering a new user
   */
  async registerUser(data: CreateUserInput): Promise<User> {
    // 1. Business Rule: No duplicate emails
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("A user with this email already exists.");
    }

    // 2. Business Rule: Basic format validation
    if (data.f_name.trim().length < 2) {
      throw new Error("Name must be at least 2 characters long.");
    }
     if (data.l_name.trim().length < 2) {
      throw new Error("Name must be at least 2 characters long.");
    }

    // 3. Data Integrity: Force email to lowercase
    const sanitizedData = {
      ...data,
      email: data.email.toLowerCase().trim(),
    };

    // 4. Call the Repository to save
    return await userRepository.create(sanitizedData);
  },

  async getAllUsers() {
    const users = await userRepository.findAll();
    
    // Security: Map through users to ensure passwords are NOT sent to the client
    return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  },
  
  async deleteUser(id: number) {
    if (!id || id <= 0) {
      throw new Error("Invalid user ID provided.");
    }
    return await userRepository.delete(id);
  }

  
};