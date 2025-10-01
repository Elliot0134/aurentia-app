import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, Building } from 'lucide-react';

interface AddressAutocompleteInputProps extends Omit<React.ComponentPropsWithoutRef<"input">, "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  addressType?: 'full' | 'regions'; // Nouveau prop pour différencier le type d'adresse
}

const AddressAutocompleteInput = forwardRef<HTMLInputElement, AddressAutocompleteInputProps>(
  ({ value, onChange, placeholder = "Commencer à taper une adresse...", disabled, addressType = 'full', ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [autocompleteDefined, setAutocompleteDefined] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

    const initAutocomplete = useCallback(async () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) return;

      try {
        setAutocompleteDefined(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing Google Maps Autocomplete:', error);
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      // Load Google Maps API if not already loaded
      const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!googleMapsApiKey || googleMapsApiKey === 'your_google_maps_api_key_here') {
        console.warn('Google Maps API key not configured. Address autocomplete will not be available.');
        setIsLoading(false);
        return;
      }

      if (!window.google) {
        setIsLoading(true);
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = initAutocomplete;
        script.onerror = () => {
          console.error('Failed to load Google Maps API');
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } else {
        initAutocomplete();
      }
    }, [initAutocomplete]);

    // Recherche de suggestions lors de changement de valeur
    useEffect(() => {
      if (!autocompleteDefined || !value) return;

      const query = value.trim();
      if (query.length >= 2) {
        setIsLoading(true);
        const autocompleteService = new google.maps.places.AutocompleteService();
        const autocompleteOptions = {
          types: addressType === 'regions' ? ['(regions)'] : ['geocode'],
          componentRestrictions: { country: ['fr'] }
        };

        autocompleteService.getPlacePredictions({
          input: query,
          ...autocompleteOptions
        }, (predictions, status) => {
          setIsLoading(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions.slice(0, 5));
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        });
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, [value, autocompleteDefined, addressType]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange?.(newValue);
    };

    const selectSuggestion = (suggestion: any) => {
      // Convertir place_id en adresse formatée
      if (suggestion.place_id && window.google?.maps?.places) {
        const placesService = new google.maps.places.PlacesService(document.createElement('div'));
        placesService.getDetails({
          placeId: suggestion.place_id,
          fields: ['formatted_address']
        }, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place?.formatted_address) {
            onChange?.(place.formatted_address);
          }
        });
      } else if (suggestion.description) {
        onChange?.(suggestion.description);
      }
      setSuggestions([]);
      setShowSuggestions(false);
      inputRef.current?.blur();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || suggestions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[selectedSuggestion]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
      }
    };

    // Fermer les suggestions quand on clique ailleurs
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          inputRef.current &&
          dropdownRef.current &&
          !inputRef.current.contains(event.target as Node) &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setShowSuggestions(false);
          setSelectedSuggestion(-1);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Masquer le dropdown Google Maps natif
    useEffect(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        .pac-container {
          display: none !important;
        }
        .pac-item {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }, []);

    const getIcon = (types: string[]) => {
      if (types.includes('establishment')) return Building;
      return MapPin;
    };

    return (
      <div className="relative">
        <Input
          ref={(el) => {
            inputRef.current = el;
            if (ref) {
              if (typeof ref === 'function') {
                ref(el);
              } else {
                ref.current = el;
              }
            }
          }}
          value={value || ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 && (value || '').length >= 2) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
            <Loader2 className="w-4 h-4 animate-spin text-aurentia-pink" />
          </div>
        )}

        {/* Dropdown personnalisé */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              top: '100%'
            }}
          >
            {suggestions.map((suggestion, index) => {
              const IconComponent = getIcon(suggestion.types || []);
              const isSelected = index === selectedSuggestion;

              return (
                <div
                  key={suggestion.place_id || index}
                  onClick={() => selectSuggestion(suggestion)}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gradient-to-r hover:from-aurentia-pink/5 hover:to-aurentia-orange/5 transition-colors duration-150 flex items-center gap-3 ${
                    isSelected ? 'bg-gradient-to-r from-aurentia-pink/10 to-aurentia-orange/10' : ''
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    isSelected
                      ? 'bg-aurentia-pink text-white'
                      : 'bg-aurentia-pink/10 text-aurentia-pink'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium text-gray-900 truncate ${
                      isSelected ? 'text-aurentia-pink' : ''
                    }`}>
                      {suggestion.structured_formatting?.main_text ||
                       suggestion.description.split(',')[0]}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {suggestion.structured_formatting?.secondary_text ||
                       suggestion.description.split(',').slice(1).join(',')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}


      </div>
    );
  }
);

AddressAutocompleteInput.displayName = 'AddressAutocompleteInput';

export { AddressAutocompleteInput };

// Type declaration for Google Maps
declare global {
  interface Window {
    google: any;
  }
}
