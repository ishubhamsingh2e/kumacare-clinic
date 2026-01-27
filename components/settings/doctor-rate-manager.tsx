"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, RefreshCw } from "lucide-react";

type RateWithDefaults = {
  visitTypeId: string;
  visitTypeName: string;
  defaultRate: number;
  customRate: number | null;
  effectiveRate: number;
  hasCustomRate: boolean;
  customRateId: string | null;
};

type Doctor = {
  id: string;
  name: string | null;
  email: string | null;
  title: string | null;
};

export function DoctorRateManager({
  doctor,
  clinicId,
  open,
  onOpenChange,
}: {
  doctor: Doctor;
  clinicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [rates, setRates] = useState<RateWithDefaults[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (open) {
      fetchRates();
    }
  }, [open, doctor.id, clinicId]);

  const fetchRates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/settings/doctor-rates?doctorId=${doctor.id}&clinicId=${clinicId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch rates");
      const data = await res.json();
      setRates(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRate = async (visitTypeId: string) => {
    const rate = parseFloat(editValue);
    if (isNaN(rate) || rate < 0) {
      toast.error("Please enter a valid rate");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/settings/doctor-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor.id,
          visitTypeId,
          rate,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to set rate");
      }

      await fetchRates();
      setEditingRateId(null);
      setEditValue("");
      toast.success("Rate updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRate = async (doctorRateId: string) => {
    if (!confirm("Remove custom rate? Doctor will use the default rate.")) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/settings/doctor-rates/${doctorRateId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete rate");
      }

      await fetchRates();
      toast.success("Custom rate removed");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (rate: RateWithDefaults) => {
    setEditingRateId(rate.visitTypeId);
    setEditValue(
      rate.customRate !== null
        ? rate.customRate.toString()
        : rate.defaultRate.toString(),
    );
  };

  const cancelEditing = () => {
    setEditingRateId(null);
    setEditValue("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:min-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            Manage Rates - {doctor.title} {doctor.name}
          </SheetTitle>
          <SheetDescription>
            Set custom rates for this doctor. If no custom rate is set, the
            default rate will be used.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 p-4">
          {isLoading && rates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading rates...
            </div>
          ) : rates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No visit types configured. Create visit types first in User
              Management.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visit Type</TableHead>
                  <TableHead>Default Rate</TableHead>
                  <TableHead>Custom Rate</TableHead>
                  <TableHead>Effective Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.visitTypeId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {rate.visitTypeName}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ₹{rate.defaultRate.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {editingRateId === rate.visitTypeId ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-24"
                            placeholder="0.00"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveRate(rate.visitTypeId)}
                            disabled={isLoading}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditing}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : rate.hasCustomRate ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="default">
                            ₹{rate.customRate!.toFixed(2)}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">₹</span>
                        <span className="font-semibold">
                          {rate.effectiveRate.toFixed(2)}
                        </span>
                        {rate.effectiveRate === 0 && (
                          <Badge variant="destructive" className="text-xs">
                            Not set
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {editingRateId !== rate.visitTypeId && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(rate)}
                            disabled={isLoading}
                          >
                            {rate.hasCustomRate ? "Edit" : "Set Custom"}
                          </Button>
                          {rate.hasCustomRate && rate.customRateId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteRate(rate.customRateId!)
                              }
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={fetchRates}
              disabled={isLoading}
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
