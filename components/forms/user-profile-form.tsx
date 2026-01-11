"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { type User } from "next-auth";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateUser } from "@/lib/actions/user";

interface UserProfileFormProps {
  user: User;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</Button>;
}

export function UserProfileForm({ user }: UserProfileFormProps) {
  const initialState = { message: "", type: "" };
  const [state, dispatch] = useActionState(updateUser, initialState);

  return (
    <form action={dispatch}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" name="name" defaultValue={user.name ?? ""} />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" defaultValue={user.email ?? ""} />
        </Field>
        
        {state?.message && (
            <FieldDescription className={state.type === 'error' ? 'text-red-500' : 'text-green-500'}>
                {state.message}
            </FieldDescription>
        )}

        <div className="flex justify-end">
            <SubmitButton />
        </div>
      </FieldGroup>
    </form>
  );
}
