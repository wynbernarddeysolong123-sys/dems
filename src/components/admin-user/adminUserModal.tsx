"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CreateUserInput } from "@/types/admin-user.types";
import { addUserAction } from "@/lib/actions/admin-user.action";

interface AddUserModalProps {
  title?: string;
  description?: string;
  onSuccess: (newUser: any) => void;
  triggerLabel?: string;
}

export function AddUserModal({
  title = "Add New User",
  description = "Enter the details to create a new user account.",
  onSuccess,
  triggerLabel = "Add New User",
}: AddUserModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateUserInput>({
    f_name: "",
    l_name: "",
    email: "",
    username: "",
    password: "",
    role: "admin", // Default value
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let fullName = `${formData.f_name} ${formData.l_name}`;

    // Basic Security: Check if fields are empty before sending
    if (!fullName || !formData.email) {
      return toast.error("Please fill in all fields");
    }

    setIsLoading(true);

    try {
      // Send the state object directly to our Server Action
      const result = await addUserAction(formData);

      if (result.success && result.user) {
        onSuccess(result.user);
        setOpen(false);
        setFormData({
          f_name: "",
          l_name: "",
          email: "",
          username: "",
          password: "",
          role: "admin",
        }); // Reset form
      } else {
        toast.error(result.error || "Failed to create user");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shrink-0">
          <UserPlus className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              {/* Row 1: First & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="f_name">First Name</Label>
                  <Input
                    id="f_name"
                    name="f_name"
                    placeholder="John"
                    value={formData.f_name}
                    onChange={(e) =>
                      setFormData({ ...formData, f_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="l_name">Last Name</Label>
                  <Input
                    id="l_name"
                    name="l_name"
                    placeholder="Doe"
                    value={formData.l_name}
                    onChange={(e) =>
                      setFormData({ ...formData, l_name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Row 2: Username & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="johndoe123"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Row 3: Password & Role */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as any })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Saving..." : "Save User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
