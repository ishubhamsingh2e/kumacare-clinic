"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type VisitType = {
  id: string;
  name: string;
  description: string | null;
  defaultRate: number;
  isActive: boolean;
  isDefault: boolean;
  clinicId: string;
  createdAt: Date;
  updatedAt: Date;
};

type Clinic = {
  id: string;
  name: string;
};

export function VisitTypeManager({
  clinic,
  initialVisitTypes,
  open,
  onOpenChange,
}: {
  clinic: Clinic;
  initialVisitTypes?: VisitType[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [visitTypes, setVisitTypes] = useState(initialVisitTypes || []);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialVisitTypes);
  const [editingVisitType, setEditingVisitType] = useState<VisitType | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    defaultRate: "0",
    isDefault: false,
  });

  // Fetch visit types if not provided initially
  useEffect(() => {
    if (!initialVisitTypes && open) {
      fetchVisitTypes();
    }
  }, [open, initialVisitTypes]);

  const fetchVisitTypes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/settings/visit-types?clinicId=${clinic.id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch visit types");
      const data = await res.json();
      setVisitTypes(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Visit type name is required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/settings/visit-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId: clinic.id,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          defaultRate: parseFloat(formData.defaultRate) || 0,
          isDefault: formData.isDefault,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create visit type");
      }

      const newVisitType = await res.json();
      setVisitTypes((prev) => [...prev, newVisitType]);
      setIsCreateSheetOpen(false);
      setFormData({
        name: "",
        description: "",
        defaultRate: "0",
        isDefault: false,
      });

      toast.success("Visit type created successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingVisitType) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/settings/visit-types/${editingVisitType.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            defaultRate: parseFloat(formData.defaultRate) || 0,
            isDefault: formData.isDefault,
          }),
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update visit type");
      }

      const updated = await res.json();
      setVisitTypes((prev) =>
        prev.map((vt) => (vt.id === updated.id ? updated : vt)),
      );
      setIsEditSheetOpen(false);
      setEditingVisitType(null);

      toast.success("Visit type updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (visitType: VisitType) => {
    if (!confirm(`Are you sure you want to delete "${visitType.name}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/settings/visit-types/${visitType.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete visit type");
      }

      const result = await res.json();

      if (result.visitType) {
        // Was deactivated instead of deleted
        setVisitTypes((prev) =>
          prev.map((vt) => (vt.id === visitType.id ? result.visitType : vt)),
        );
        toast.success(result.message);
      } else {
        // Was deleted
        setVisitTypes((prev) => prev.filter((vt) => vt.id !== visitType.id));
        toast.success("Visit type deleted successfully");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditSheet = (visitType: VisitType) => {
    setEditingVisitType(visitType);
    setFormData({
      name: visitType.name,
      description: visitType.description || "",
      defaultRate: visitType.defaultRate.toString(),
      isDefault: visitType.isDefault,
    });
    setIsEditSheetOpen(true);
  };

  const content = (
    <Card className={open ? "border-0 shadow-none" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Visit Types</CardTitle>
            <CardDescription>
              Manage consultation types and their default rates for{" "}
              {clinic.name}
            </CardDescription>
          </div>
          <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Visit Type
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Create Visit Type</SheetTitle>
                <SheetDescription>
                  Add a new type of visit/consultation with a default rate.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., First Visit, Follow-up, Emergency"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultRate">Default Rate (₹)</Label>
                  <Input
                    id="defaultRate"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.defaultRate}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultRate: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Set to 0 to require configuration before use
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isDefault: checked })
                    }
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer">
                    Set as default for online bookings
                  </Label>
                </div>
              </div>
              <SheetFooter className="flex flex-row justify-end items-center">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateSheetOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isLoading}>
                  Create
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Default Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visitTypes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No visit types yet. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              visitTypes.map((vt) => (
                <TableRow key={vt.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {vt.name}
                      {vt.isDefault && (
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Default
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {vt.description || "-"}
                  </TableCell>
                  <TableCell>
                    ₹{vt.defaultRate.toFixed(2)}
                    {vt.defaultRate === 0 && (
                      <Badge variant="destructive" className="ml-2">
                        Not configured
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {vt.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditSheet(vt)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(vt)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="md:min-w-2xl">
          <SheetHeader>
            <SheetTitle>Edit Visit Type</SheetTitle>
            <SheetDescription>
              Update the visit type details and default rate.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., First Visit, Follow-up, Emergency"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-defaultRate">Default Rate (₹)</Label>
              <Input
                id="edit-defaultRate"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.defaultRate}
                onChange={(e) =>
                  setFormData({ ...formData, defaultRate: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Set to 0 to require configuration before use
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isDefault: checked })
                }
              />
              <Label htmlFor="edit-isDefault" className="cursor-pointer">
                Set as default for online bookings
              </Label>
            </div>
          </div>
          <SheetFooter className="flex flex-row justify-end items-center">
            <Button variant="outline" onClick={() => setIsEditSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              Update
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Card>
  );

  // If controlled by parent (sheet mode), wrap in Sheet
  if (open !== undefined && onOpenChange) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:min-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Manage Visit Types</SheetTitle>
            <SheetDescription>
              Configure consultation types and rates for your clinic
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 p-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading visit types...
              </div>
            ) : (
              content
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Otherwise return the card directly (page mode)
  return content;
}
