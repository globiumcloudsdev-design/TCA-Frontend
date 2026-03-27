// src/components/common/LocationPicker.jsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Google Maps API key from environment
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function LocationPicker({
  value = { latitude: null, longitude: null, address: '', place_id: '' },
  onChange,
  error,
  disabled = false,
  className = ''
}) {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const mapRef = useRef(null);
  const searchRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Load Google Maps script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is missing');
      return;
    }

    if (window.google?.maps) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || map) return;

    const defaultLocation = { lat: 31.5204, lng: 74.3587 }; // Lahore default

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: value.latitude && value.longitude 
        ? { lat: value.latitude, lng: value.longitude }
        : defaultLocation,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    const markerInstance = new window.google.maps.Marker({
      map: mapInstance,
      draggable: !disabled,
      position: value.latitude && value.longitude 
        ? { lat: value.latitude, lng: value.longitude }
        : defaultLocation,
    });

    // Update location when marker is dragged
    markerInstance.addListener('dragend', () => {
      const position = markerInstance.getPosition();
      const lat = position.lat();
      const lng = position.lng();
      
      // Reverse geocode to get address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          onChange({
            latitude: lat,
            longitude: lng,
            address: results[0].formatted_address,
            place_id: results[0].place_id
          });
          setSearchInput(results[0].formatted_address);
        } else {
          onChange({
            latitude: lat,
            longitude: lng,
            address: '',
            place_id: ''
          });
        }
      });
    });

    // Click on map to place marker
    mapInstance.addListener('click', (e) => {
      if (disabled) return;
      
      markerInstance.setPosition(e.latLng);
      
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: e.latLng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          onChange({
            latitude: e.latLng.lat(),
            longitude: e.latLng.lng(),
            address: results[0].formatted_address,
            place_id: results[0].place_id
          });
          setSearchInput(results[0].formatted_address);
        }
      });
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  }, [scriptLoaded, value.latitude, value.longitude, disabled]);

  // Initialize autocomplete
  useEffect(() => {
    if (!scriptLoaded || !searchRef.current || autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(searchRef.current, {
      types: ['geocode', 'establishment'],
      componentRestrictions: { country: 'pk' }, // Restrict to Pakistan
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (!place.geometry || !place.geometry.location) {
        console.log('No details available for this place');
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      // Update map view
      if (map) {
        map.setCenter({ lat, lng });
        map.setZoom(17);
      }

      // Update marker
      if (marker) {
        marker.setPosition({ lat, lng });
      }

      onChange({
        latitude: lat,
        longitude: lng,
        address: place.formatted_address,
        place_id: place.place_id
      });

      setSearchInput(place.formatted_address);
      setSearchResults([]);
    });

    autocompleteRef.current = autocomplete;
  }, [scriptLoaded, map, marker]);

  // Manual search
  const handleSearch = async () => {
    if (!searchInput.trim() || !scriptLoaded) return;

    setIsSearching(true);
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchInput }, (results, status) => {
      setIsSearching(false);
      
      if (status === 'OK' && results.length > 0) {
        const place = results[0];
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        // Update map
        if (map) {
          map.setCenter({ lat, lng });
          map.setZoom(17);
        }

        // Update marker
        if (marker) {
          marker.setPosition({ lat, lng });
        }

        onChange({
          latitude: lat,
          longitude: lng,
          address: place.formatted_address,
          place_id: place.place_id
        });

        setSearchInput(place.formatted_address);
      } else {
        setSearchResults([]);
      }
    });
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          setIsLoading(false);
          
          if (status === 'OK' && results[0]) {
            // Update map
            if (map) {
              map.setCenter({ lat: latitude, lng: longitude });
              map.setZoom(17);
            }

            // Update marker
            if (marker) {
              marker.setPosition({ lat: latitude, lng: longitude });
            }

            onChange({
              latitude,
              longitude,
              address: results[0].formatted_address,
              place_id: results[0].place_id
            });

            setSearchInput(results[0].formatted_address);
          }
        });
      },
      (error) => {
        setIsLoading(false);
        alert('Unable to get your location: ' + error.message);
      }
    );
  };

  // Clear location
  const clearLocation = () => {
    onChange({
      latitude: null,
      longitude: null,
      address: '',
      place_id: ''
    });
    setSearchInput('');
    
    if (marker) {
      marker.setPosition(null);
    }
  };

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Input
            ref={searchRef}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for a location..."
            disabled={disabled || !scriptLoaded}
            className="pr-10"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearLocation}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSearch}
          disabled={isSearching || !scriptLoaded || disabled}
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="ml-2 hidden sm:inline">Search</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isLoading || !scriptLoaded || disabled}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          <span className="ml-2 hidden sm:inline">Current</span>
        </Button>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-[300px] sm:h-[400px] rounded-lg border border-gray-200"
      />

      {/* Selected Location Info */}
      {value.address && (
        <Card className="bg-gray-50">
          <CardContent className="p-3">
            <Label className="text-xs text-muted-foreground">Selected Location</Label>
            <p className="text-sm font-medium">{value.address}</p>
            <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
              <span>Lat: {value.latitude?.toFixed(6)}</span>
              <span>Lng: {value.longitude?.toFixed(6)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}