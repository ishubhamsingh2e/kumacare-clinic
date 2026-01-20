"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidLength = newPassword.length >= 6;
  const isMatching = newPassword === confirmPassword && confirmPassword !== "";
  const hasCurrent = currentPassword.length > 0;

  const isValid = isValidLength && isMatching && hasCurrent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Password updated successfully");
        // Reset form on success
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to update password");
      }
    } catch (error) {
      toast.error("An error occurred while updating password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isSubmitting}
            required
            minLength={6}
          />
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1",
                isValidLength ? "text-green-500" : "text-muted-foreground"
              )}
            >
              {isValidLength ? (
                <Check className="h-3 w-3" />
              ) : (
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              )}
              At least 6 characters
            </span>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            required
            minLength={6}
          />
          {confirmPassword.length > 0 && (
            <div className="text-xs flex items-center gap-1">
              {isMatching ? (
                <span className="text-green-500 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Passwords match
                </span>
              ) : (
                <span className="text-destructive flex items-center gap-1">
                  <X className="h-3 w-3" /> Passwords do not match
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
