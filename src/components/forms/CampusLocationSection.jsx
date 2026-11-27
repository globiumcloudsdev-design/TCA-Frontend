'use client';

import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { LocateFixed, ClipboardPaste, ExternalLink, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import InputField from '@/components/common/InputField';
import { Button } from '@/components/ui/button';
import { parseCoordinates, validateRadius, hasCoordinates, googleMapsUrl, RADIUS_MIN, RADIUS_MAX } from '@/lib/coordinates';

/**
 * "Campus location for attendance": latitude / longitude / radius for the mobile check-in geofence.
 * Works inside the branch react-hook-form (fields location.latitude, location.longitude, location.attendance_radius_m).
 */
export default function CampusLocationSection({ control, watch, setValue }) {
  const lat = watch('location.latitude');
  const lng = watch('location.longitude');
  const radius = watch('location.attendance_radius_m');
  const [paste, setPaste] = useState('');
  const [locating, setLocating] = useState(false);

  const set = (name, v) => setValue(name, v, { shouldDirty: true, shouldValidate: true });
  const ready = hasCoordinates({ latitude: lat, longitude: lng });
  const radiusCheck = validateRadius(radius);

  const applyPaste = (text) => {
    const parsed = parseCoordinates(text);
    if (!parsed) {
      toast.error('Could not read that. Paste coordinates like "24.9445, 66.9391" (from Google Maps) and try again.');
      return;
    }
    set('location.latitude', parsed.latitude);
    set('location.longitude', parsed.longitude);
    setPaste('');
    toast.success('Coordinates filled in. Use “Open in Google Maps” to double-check the point.');
  };

  const useMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error("Your browser can't share its location. Paste the coordinates from Google Maps instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set('location.latitude', Number(pos.coords.latitude.toFixed(6)));
        set('location.longitude', Number(pos.coords.longitude.toFixed(6)));
        setLocating(false);
        const acc = Math.round(pos.coords.accuracy || 0);
        toast.success(`Location set${acc ? ` (accurate to about ${acc} m)` : ''}. Stand inside the campus for best results.`);
      },
      (err) => {
        setLocating(false);
        toast.error(
          err.code === 1
            ? 'Location permission was denied. Allow location access in your browser, or paste the coordinates instead.'
            : "Couldn't get your location. Try again outdoors, or paste the coordinates from Google Maps."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">Campus location for attendance</h3>
          <p className="text-sm text-muted-foreground">Teachers can check in/out from the mobile app only while inside this circle.</p>
        </div>
        {ready ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" /> Location set
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
            <AlertTriangle className="h-3.5 w-3.5" /> No coordinates — check-in won’t work
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="location.latitude"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <InputField label="Latitude" {...field} value={field.value ?? ''} error={error} type="number" step="any" placeholder="e.g. 24.9445" />
          )}
        />
        <Controller
          name="location.longitude"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <InputField label="Longitude" {...field} value={field.value ?? ''} error={error} type="number" step="any" placeholder="e.g. 66.9391" />
          )}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={useMyLocation} disabled={locating}>
          {locating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
          Use my current location
        </Button>
        {ready ? (
          <Button type="button" variant="outline" asChild>
            <a href={googleMapsUrl(lat, lng)} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Open in Google Maps
            </a>
          </Button>
        ) : (
          <Button type="button" variant="outline" disabled>
            <ExternalLink className="mr-2 h-4 w-4" /> Open in Google Maps
          </Button>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Paste from Google Maps</label>
        <div className="flex gap-2">
          <input
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            onPaste={(e) => {
              const text = e.clipboardData.getData('text');
              if (parseCoordinates(text)) {
                e.preventDefault();
                applyPaste(text);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyPaste(paste);
              }
            }}
            placeholder="24.9445, 66.9391"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="button" variant="outline" onClick={() => applyPaste(paste)} disabled={!paste.trim()}>
            <ClipboardPaste className="mr-2 h-4 w-4" /> Fill
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">In Google Maps, right-click the campus gate and click the coordinates to copy them, then paste here.</p>
      </div>

      <Controller
        name="location.attendance_radius_m"
        control={control}
        render={({ field }) => (
          <div>
            <InputField
              label={`Allowed radius (metres, ${RADIUS_MIN}–${RADIUS_MAX})`}
              {...field}
              value={field.value ?? ''}
              type="number"
              step="1"
              min={RADIUS_MIN}
              max={RADIUS_MAX}
              placeholder="50"
            />
            {!radiusCheck.ok && <p className="mt-1 text-xs text-red-600">{radiusCheck.error}</p>}
          </div>
        )}
      />
    </div>
  );
}
