'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Konfigurierbarer Tile-Endpunkt. Ein hart verdrahtetes 127.0.0.1 zeigt im
// Browser des Besuchers auf DESSEN Rechner und ist unter HTTPS zusätzlich
// als Mixed Content blockiert.
const TILE_BASE_URL = process.env.NEXT_PUBLIC_TILE_BASE_URL ?? 'http://127.0.0.1:3001';

const PANEL_WIDTH = 288; // w-72
const PANEL_MIN_VISIBLE = 48;

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // --- React State for Draggable Panel ---
  const [selectedRiver, setSelectedRiver] = useState<{
    name: string;
    systemId: string;
    segmentId: string;
    strahler: string;
    lengthKm: string;
  } | null>(null);

  // Tile-Fehler werden sichtbar gemacht statt verschluckt.
  const [tileError, setTileError] = useState<string | null>(null);

  const [panelPos, setPanelPos] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  // Drag logic
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: panelPos.x,
      startPosY: panelPos.y,
    };
  }, [panelPos.x, panelPos.y]);

  // Drag: auf die Bildwiederholrate gedrosselt und in den Viewport geclampt.
  useEffect(() => {
    if (!isDragging) return;

    const container = mapContainer.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (!dragRef.current) return;

        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        const maxX = (container?.clientWidth ?? PANEL_WIDTH) - PANEL_MIN_VISIBLE;
        const maxY = (container?.clientHeight ?? 0) - PANEL_MIN_VISIBLE;

        setPanelPos({
          x: Math.min(Math.max(dragRef.current.startPosX + dx, 0), Math.max(maxX, 0)),
          y: Math.min(Math.max(dragRef.current.startPosY + dy, 0), Math.max(maxY, 0)),
        });
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isDragging]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const style: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        basemap: {
          type: 'vector',
          url: `${TILE_BASE_URL}/basemap`,
        },
        rivers: {
          type: 'vector',
          url: `${TILE_BASE_URL}/rivers_global`,
        },
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': '#0f172a',
          },
        },
        {
          id: 'earth',
          type: 'fill',
          source: 'basemap',
          'source-layer': 'earth',
          paint: {
            'fill-color': '#1e293b',
          },
        },
        {
          id: 'water-bodies-fill',
          type: 'fill',
          source: 'basemap',
          'source-layer': 'water',
          filter: ['==', '$type', 'Polygon'],
          paint: {
            'fill-color': '#0284c7',
          },
        },
        {
          id: 'water-bodies-lines',
          type: 'line',
          source: 'basemap',
          'source-layer': 'water',
          filter: ['==', '$type', 'LineString'],
          paint: {
            'line-color': '#0284c7',
            'line-width': 1,
          },
        },
        {
          id: 'landuse',
          type: 'fill',
          source: 'basemap',
          'source-layer': 'landuse',
          paint: {
            'fill-color': '#334155',
          },
        },
        {
          id: 'boundaries',
          type: 'line',
          source: 'basemap',
          'source-layer': 'boundaries',
          paint: {
            'line-color': '#475569',
            'line-width': 1,
          },
        },
        {
          id: 'roads',
          type: 'line',
          source: 'basemap',
          'source-layer': 'roads',
          paint: {
            'line-color': '#94a3b8',
            'line-width': 1.5,
          },
        },
        {
          id: 'places',
          type: 'symbol',
          source: 'basemap',
          'source-layer': 'places',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 14,
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 1,
          },
        },
        {
          id: 'rivers-base',
          type: 'line',
          source: 'rivers',
          'source-layer': 'rivers',
          filter: ['all', ['has', 'clean_name'], ['!=', ['get', 'clean_name'], '']],
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#0ea5e9', // Lighter cyan to differentiate from basemap lakes
            'line-width': ['interpolate', ['linear'], ['get', 'strahler_order'], 1, 0.5, 9, 6],
            'line-opacity': 0.8,
          },
        },
        {
          id: 'rivers-highlight',
          type: 'line',
          source: 'rivers',
          'source-layer': 'rivers',
          filter: ['==', ['get', 'river_system_id'], ''],
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#ff9900', // Bright orange highlight from your test server
            'line-width': ['interpolate', ['linear'], ['get', 'strahler_order'], 1, 2, 9, 10],
            'line-opacity': 1.0,
            'line-blur': 1, // Slight glow effect
          },
        }
      ],
    };

    const newMap = new maplibregl.Map({
      container: mapContainer.current,
      style: style,
      center: [11.58, 48.13], // Marienplatz München
      zoom: 12,
      attributionControl: false,
    });
    
    map.current = newMap;
    newMap.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Tile-Fehler fangen und im State anzeigen
    newMap.on('error', (e) => {
      const message = (e as unknown as { error?: Error }).error?.message ?? 'Unbekannter Kartenfehler';
      console.error('[Map] MapLibre error:', message);
      setTileError(
        `Kartendaten konnten nicht geladen werden (${TILE_BASE_URL}). ` +
        'Läuft der Tile-Server und ist NEXT_PUBLIC_TILE_BASE_URL korrekt gesetzt?'
      );
    });

    const safeSetHighlight = (systemId: string) => {
      if (!newMap.getLayer('rivers-highlight')) return;
      newMap.setFilter('rivers-highlight', ['==', ['get', 'river_system_id'], systemId]);
    };

    newMap.on('click', 'rivers-base', (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        const riverSystemId = props.river_system_id;
        
        const riverName = String(props.clean_name ?? 'Unbenannter Fluss');
        const segmentId = String(props.global_id ?? '?');
        const strahler = String(props.strahler_order ?? '?');
        const lengthKm = typeof props.length === 'number' ? (props.length / 1000).toFixed(2) : '?';

        if (riverSystemId) {
          safeSetHighlight(String(riverSystemId));
          
          // Set React state instead of opening maplibregl.Popup
          setSelectedRiver({
            name: riverName,
            systemId: String(riverSystemId),
            segmentId: segmentId,
            strahler: strahler,
            lengthKm: lengthKm
          });
        }
      }
    });

    // Deselect if clicking outside the rivers layer
    newMap.on('click', (e) => {
      if (!newMap.getLayer('rivers-base')) return;
      const features = newMap.queryRenderedFeatures(e.point, { layers: ['rivers-base'] });
      if (!features.length) {
        safeSetHighlight('');
        setSelectedRiver(null);
      }
    });

    newMap.on('mouseenter', 'rivers-base', () => {
      newMap.getCanvas().style.cursor = 'pointer';
    });

    newMap.on('mouseleave', 'rivers-base', () => {
      newMap.getCanvas().style.cursor = '';
    });

    return () => {
      newMap.remove();
      map.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl border border-border/40 bg-card/50">
      <div ref={mapContainer} className="w-full h-full" />

      {tileError && (
        <div
          role="alert"
          data-testid="map-tile-error"
          className="absolute inset-x-4 top-4 z-40 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive backdrop-blur-sm"
        >
          {tileError}
        </div>
      )}
      
      {/* Draggable React Popup */}
      {selectedRiver && (
        <div 
          style={{ left: panelPos.x, top: panelPos.y, position: 'absolute' }}
          className="z-50 bg-white shadow-xl rounded-lg border border-slate-200 w-72 flex flex-col overflow-hidden select-none"
        >
          {/* Drag Handle & Header */}
          <div 
            onMouseDown={handleMouseDown}
            className="bg-slate-100 px-4 py-3 cursor-move flex justify-between items-center border-b border-slate-200"
          >
            <h3 className="m-0 text-[#ff9900] font-bold text-base truncate pr-2">
              {selectedRiver.name}
            </h3>
            <button 
              onClick={() => {
                setSelectedRiver(null);
                if (map.current && map.current.getLayer('rivers-highlight')) {
                  map.current.setFilter('rivers-highlight', ['==', ['get', 'river_system_id'], '']);
                }
              }}
              className="text-slate-500 hover:text-slate-800 cursor-pointer p-1 font-bold"
              title="Schließen"
            >
              ✕
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 text-sm text-slate-700 space-y-2 cursor-default">
            <div><strong className="text-slate-900">Segment ID:</strong> {selectedRiver.segmentId}</div>
            <div><strong className="text-slate-900">Länge:</strong> {selectedRiver.lengthKm} km</div>
            <div><strong className="text-slate-900">Strahler Ordnung:</strong> {selectedRiver.strahler}</div>
          </div>
        </div>
      )}
    </div>
  );
}
