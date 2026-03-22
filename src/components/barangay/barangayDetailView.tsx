"use client";

import { useEffect, useState } from "react";
import { Barangay } from "@/types/barangay-management";
import { MapPin, ExternalLink, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPuroksByBarangayAction } from "@/lib/actions/purok.action";
import { Purok } from "@/types/purok-management";
import { PurokTable } from "./purok/purokTable";
import { PurokModal } from "./purok/purokModal";
import Link from "next/link";

interface BarangayDetailViewProps {
  barangay: Barangay;
}

export function BarangayDetailView({ barangay }: BarangayDetailViewProps) {
  const [puroks, setPuroks] = useState<Purok[]>([]);
  const [isPurokModalOpen, setIsPurokModalOpen] = useState(false);
  const [editingPurok, setEditingPurok] = useState<Purok | undefined>(undefined);

  const fetchPuroks = async (id: number) => {
    const result = await getPuroksByBarangayAction(id);
    if (result.success && result.data) {
      setPuroks(result.data);
    }
  };

  useEffect(() => {
    if (barangay) {
      fetchPuroks(barangay.barangay_id);
    }
  }, [barangay]);

  if (!barangay || barangay.latitude === null || barangay.longitude === null) {
    return (
      <div className="p-8 text-center bg-white rounded-none border">
        <p className="text-muted-foreground">Coordinates not set for this barangay.</p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/dashboard/barangay">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
          </Link>
        </Button>
      </div>
    );
  }

  const lat = Number(barangay.latitude);
  const lon = Number(barangay.longitude);

  const delta = 0.005;
  const bbox = `${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Map and Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-none border shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2 bg-gray-50/50">
              <MapPin className="h-5 w-5 text-red-500" />
              <h2 className="font-bold text-gray-900">{barangay.barangay_name} Location</h2>
            </div>
            <div className="aspect-square w-full">
              <iframe
                title={`Map of ${barangay.barangay_name}`}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={mapUrl}
                className="border-none"
              />
            </div>
            <div className="p-4 bg-gray-50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded-none border">
                  {lat.toFixed(6)}, {lon.toFixed(6)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-none border shadow-sm p-4 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500">Barangay Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Captain</span>
                <span className="font-medium">{barangay.barangay_captain_name || "---"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Population</span>
                <span className="font-medium">{barangay.total_population.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Risk Type</span>
                <span className="font-medium capitalize">{barangay.prone_type || "---"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Purok Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-none border shadow-sm p-6 flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 italic">Purok Management</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage sub-locations and pick-up points for this barangay.</p>
              </div>
              <Button
                className="gap-2 font-semibold shadow-md bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setEditingPurok(undefined);
                  setIsPurokModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add New Purok
              </Button>
            </div>

            <div className="flex-1 overflow-auto">
              <PurokTable
                data={puroks}
                onEdit={(p) => {
                  setEditingPurok(p);
                  setIsPurokModalOpen(true);
                }}
                onRefresh={() => fetchPuroks(barangay.barangay_id)}
              />
            </div>
          </div>
        </div>
      </div>

      {isPurokModalOpen && (
        <PurokModal
          isOpen={isPurokModalOpen}
          onClose={() => setIsPurokModalOpen(false)}
          purok={editingPurok}
          barangayId={barangay.barangay_id}
          onSuccess={() => fetchPuroks(barangay.barangay_id)}
        />
      )}
    </div>
  );
}
