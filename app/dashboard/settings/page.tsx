import { auth } from "@/lib/auth";
import { UserProfileForm } from "@/components/forms/user-profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account" disabled>
            Account
          </TabsTrigger>
          <TabsTrigger value="appearance" disabled>
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" disabled>
            Notifications
          </TabsTrigger>
          <TabsTrigger value="display" disabled>
            Display
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is how others will see you on the site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserProfileForm user={user} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
