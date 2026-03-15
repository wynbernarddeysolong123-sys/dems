"use server";

import { auth } from "@/lib/auth";
import { userService } from "@/lib/services/admin-user.services";
import { revalidatePath } from "next/cache";
import { CreateUserInput, ActionResponse } from "@/types/admin-user.types";

/**
 * Server Action: The entry point from your "AddUserModal"
 */
export async function addUserAction(
  payload: CreateUserInput,
): Promise<ActionResponse> {
  try {
    // 1. Authenticate the requester
    const session = await auth();

    // 2. Authorize: Only ADMINs can hit the database
    if (!session || (session.user?.role as string) !== "admin") {
      return {
        success: false,
        error: "Forbidden: Admin access required.",
      };
    }

    // 3. Hand off to the Service Layer
    // This handles the "Is email taken?" and "Is name valid?" logic
    const newUser = await userService.registerUser(payload);

    // 4. Refresh the data on the User Management page
    revalidatePath("/dashboard/users");

    return {
      success: true,
      user: newUser,
    };
  } catch (error: any) {
    // Catch errors from the Service (e.g., "Email already exists")
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}
export async function getUsersAction() {
  try {
    const users = await userService.getAllUsers();
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: "Failed to fetch users" };
  }
}
export async function deleteUserAction(id: number) {
  try {
    await userService.deleteUser(id); 
    
    revalidatePath("/admin-user"); 
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete user" };
  }
}