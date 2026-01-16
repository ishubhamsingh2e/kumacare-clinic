"use client";

import { useQueryState } from "nuqs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SettingsTabsClientProps {
  accountContent: React.ReactNode;
  usersContent: React.ReactNode;
  canManageUsers: boolean;
  clinicManagementContent: React.ReactNode;
  isManager: boolean;
}

export function SettingsTabsClient({
  accountContent,
  usersContent,
  canManageUsers,
  clinicManagementContent,
  isManager,
}: SettingsTabsClientProps) {
  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "account",
    shallow: false,
  });

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        {isManager && (
          <TabsTrigger value="clinic">Clinic Management</TabsTrigger>
        )}
        {canManageUsers && (
          <TabsTrigger value="users">User Management</TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="account">{accountContent}</TabsContent>
      {isManager && (
        <TabsContent value="clinic">{clinicManagementContent}</TabsContent>
      )}
      {canManageUsers && (
        <TabsContent value="users">{usersContent}</TabsContent>
      )}
    </Tabs>
  );
}
