"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Edit, Trash2, IndianRupee } from "lucide-react";
import { EditRoleDialog } from "./edit-role-dialog";
import { RemoveMemberDialog } from "./remove-member-dialog";
import { DoctorRateManager } from "@/components/settings/doctor-rate-manager";

interface Role {
  id: string;
  name: string;
  priority: number;
}

interface Member {
  id: string;
  userId: string;
  roleId: string;
  User: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    title?: string | null;
  };
  Role: Role;
  Clinic: {
    id: string;
    name: string;
  };
}

interface TeamMembersTableProps {
  members: Member[];
  roles: Role[];
  currentUserId: string;
  currentUserRole?: Role;
  isOwner: boolean;
  ownerId: string;
  canManage: boolean;
}

export function TeamMembersTable({
  members,
  roles,
  currentUserId,
  currentUserRole,
  isOwner,
  ownerId,
  canManage: hasManagePermission,
}: TeamMembersTableProps) {
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [removingMember, setRemovingMember] = useState<Member | null>(null);
  const [managingRatesForMember, setManagingRatesForMember] =
    useState<Member | null>(null);

  const canManage = (member: Member) => {
    // Must have manage permission
    if (!hasManagePermission) {
      return false;
    }

    // Owner can manage everyone except themselves
    if (isOwner && member.userId !== currentUserId) {
      return true;
    }

    // Can't manage the owner
    if (member.userId === ownerId) {
      return false;
    }

    // Can't manage yourself
    if (member.userId === currentUserId) {
      return false;
    }

    // Can manage if your role priority is higher
    if (currentUserRole && currentUserRole.priority > member.Role.priority) {
      return true;
    }

    return false;
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isDoctor = (member: Member) => {
    return member.User.title === "Dr.";
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Clinic</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-17.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No team members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.User.image || ""} />
                        <AvatarFallback>
                          {getInitials(member.User.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {member.User.name || "Unknown"}
                        </span>
                        {member.userId === ownerId && (
                          <Badge variant="secondary" className="gap-1">
                            <Crown className="h-3 w-3" />
                            Owner
                          </Badge>
                        )}
                        {member.userId === currentUserId && (
                          <Badge variant="outline">You</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{member.User.email}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {member.Clinic.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.Role.name}</Badge>
                  </TableCell>
                  <TableCell>
                    {canManage(member) && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setEditingMember(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {isDoctor(member) && (
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => setManagingRatesForMember(member)}
                          >
                            <IndianRupee className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setRemovingMember(member)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingMember && (
        <EditRoleDialog
          open={!!editingMember}
          onOpenChange={(open) => !open && setEditingMember(null)}
          member={editingMember}
          roles={roles}
          currentUserRole={currentUserRole}
        />
      )}

      {removingMember && (
        <RemoveMemberDialog
          open={!!removingMember}
          onOpenChange={(open) => !open && setRemovingMember(null)}
          member={removingMember}
        />
      )}

      {managingRatesForMember && (
        <DoctorRateManager
          doctor={{
            id: managingRatesForMember.userId,
            name: managingRatesForMember.User.name,
            email: managingRatesForMember.User.email,
            title: managingRatesForMember.User.title ?? null,
          }}
          clinicId={managingRatesForMember.Clinic.id}
          open={!!managingRatesForMember}
          onOpenChange={(open) => !open && setManagingRatesForMember(null)}
        />
      )}
    </>
  );
}
