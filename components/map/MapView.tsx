"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { PinPublic, GroupPinPublic } from "@/types/database";
import CategoryFilter from "./CategoryFilter";
import PinPopup from "./PinPopup";
import GroupPinPopup from "./GroupPinPopup";
import DropPinModal from "./DropPinModal";
import { createClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

interface BBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function MapView({ userId }: { userId: string }) {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: 10.9028,
    latitude: 49.8988,
    zoom: 13,
  });
  const [pins, setPins] = useState<PinPublic[]>([]);
  const [groupPins, setGroupPins] = useState<GroupPinPublic[]>([]);
  const [selectedPin, setSelectedPin] = useState<PinPublic | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupPinPublic | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [dropPinOpen, setDropPinOpen] = useState(false);
  const [dropPinLocation, setDropPinLocation] = useState<{ lng: number; lat: number } | null>(null);
  const bboxRef = useRef<BBox | null>(null);
  const mapRef = useRef<any>(null);

  const fetchPins = useCallback(async (bbox: BBox, category: string | null) => {
    const params = new URLSearchParams({
      min_lng: String(bbox.minLng),
      min_lat: String(bbox.minLat),
      max_lng: String(bbox.maxLng),
      max_lat: String(bbox.maxLat),
    });
    if (category) params.set("category", category);
    const res = await fetch(`/api/pins?${params}`);
    if (res.ok) {
      const data = await res.json();
      setPins(data.pins || []);
      setGroupPins(data.groups || []);
    }
  }, []);

  const computeBBox = useCallback((): BBox | null => {
    if (!mapRef.current) return null;
    const bounds = mapRef.current.getBounds();
    if (!bounds) return null;
    return {
      minLng: bounds.getWest(),
      minLat: bounds.getSouth(),
      maxLng: bounds.getEast(),
      maxLat: bounds.getNorth(),
    };
  }, []);

  const handleMoveEnd = useCallback(() => {
    const bbox = computeBBox();
    if (!bbox) return;
    bboxRef.current = bbox;
    fetchPins(bbox, categoryFilter);
  }, [computeBBox, fetchPins, categoryFilter]);

  useEffect(() => {
    if (bboxRef.current) {
      fetchPins(bboxRef.current, categoryFilter);
    }
  }, [categoryFilter, fetchPins]);

  // Realtime subscription for new pins
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("map-pins")
      .on("postgres_changes", { event: "*", schema: "public", table: "pins", filter: "is_active=eq.true" }, () => {
        if (bboxRef.current) fetchPins(bboxRef.current, categoryFilter);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPins, categoryFilter]);

  function handleMapDblClick(e: any) {
    setDropPinLocation({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    setDropPinOpen(true);
  }

  function handlePinDropped() {
    if (bboxRef.current) fetchPins(bboxRef.current, categoryFilter);
    toast.success("Pin dropped! People nearby can now find you.");
  }

  return (
    <div className="relative w-full h-full">
      {/* Category filter bar */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
        <CategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />
      </div>

      {/* Drop pin button */}
      <div className="absolute bottom-8 right-4 z-10">
        <Button
          onClick={() => { setDropPinLocation(null); setDropPinOpen(true); }}
          className="rounded-full shadow-lg gap-2 bg-indigo-600 hover:bg-indigo-700"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Drop Pin
        </Button>
      </div>

      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        onLoad={handleMoveEnd}
        onDblClick={handleMapDblClick}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: "100%", height: "100%" }}
        doubleClickZoom={false}
        maxBounds={[[10.80, 49.82], [11.05, 50.02]]}
      >
        <GeolocateControl position="bottom-left" trackUserLocation />
        <NavigationControl position="bottom-left" />

        {/* Solo pins */}
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            longitude={pin.longitude}
            latitude={pin.latitude}
            anchor="center"
            onClick={(e) => { e.originalEvent.stopPropagation(); setSelectedPin(pin); setSelectedGroup(null); }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-md cursor-pointer hover:scale-110 transition-transform border-2 border-white"
              style={{ backgroundColor: pin.category_color }}
              title={pin.title}
            >
              {pin.category_icon}
            </div>
          </Marker>
        ))}

        {/* Group pins */}
        {groupPins.map((group) => (
          <Marker
            key={group.id}
            longitude={group.longitude}
            latitude={group.latitude}
            anchor="center"
            onClick={(e) => { e.originalEvent.stopPropagation(); setSelectedGroup(group); setSelectedPin(null); }}
          >
            <div
              className="relative w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-lg cursor-pointer hover:scale-110 transition-transform border-3 border-white"
              style={{ backgroundColor: group.category_color }}
              title={group.name}
            >
              {group.category_icon}
              <span className="absolute -top-1 -right-1 bg-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow text-gray-800 border border-gray-200">
                {group.member_count}
              </span>
            </div>
          </Marker>
        ))}

        {/* Solo pin popup */}
        {selectedPin && (
          <Popup
            longitude={selectedPin.longitude}
            latitude={selectedPin.latitude}
            anchor="bottom"
            onClose={() => setSelectedPin(null)}
            closeOnClick={false}
          >
            <PinPopup pin={selectedPin} userId={userId} onClose={() => setSelectedPin(null)} />
          </Popup>
        )}

        {/* Group pin popup */}
        {selectedGroup && (
          <Popup
            longitude={selectedGroup.longitude}
            latitude={selectedGroup.latitude}
            anchor="bottom"
            onClose={() => setSelectedGroup(null)}
            closeOnClick={false}
          >
            <GroupPinPopup group={selectedGroup} userId={userId} onClose={() => setSelectedGroup(null)} />
          </Popup>
        )}
      </Map>

      <DropPinModal
        open={dropPinOpen}
        onClose={() => setDropPinOpen(false)}
        initialLocation={dropPinLocation}
        onPinDropped={handlePinDropped}
        userId={userId}
      />
    </div>
  );
}
