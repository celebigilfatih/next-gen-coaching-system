/**
 * Layer Management Hook
 * Handles layer creation, reordering, visibility, and locking
 */

import { useState, useCallback } from "react";

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  order: number;
}

export interface UseLayerManagerReturn {
  layers: Layer[];
  activeLayerId: string | null;
  setActiveLayerId: (id: string | null) => void;
  addLayer: (name?: string) => string;
  removeLayer: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  renameLayer: (id: string, name: string) => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  duplicateLayer: (id: string) => string;
  getLayerById: (id: string) => Layer | undefined;
  isLayerVisible: (id: string) => boolean;
  isLayerLocked: (id: string) => boolean;
}

export function useLayerManager(initialLayers?: Layer[]): UseLayerManagerReturn {
  const [layers, setLayers] = useState<Layer[]>(
    initialLayers || [
      { id: "layer-1", name: "Layer 1", visible: true, locked: false, order: 0 },
    ]
  );
  const [activeLayerId, setActiveLayerId] = useState<string | null>("layer-1");

  const addLayer = useCallback((name?: string) => {
    const newId = `layer-${Date.now()}`;
    const maxOrder = Math.max(...layers.map(l => l.order), -1);
    
    setLayers(prev => [
      ...prev,
      {
        id: newId,
        name: name || `Layer ${prev.length + 1}`,
        visible: true,
        locked: false,
        order: maxOrder + 1,
      },
    ]);
    
    setActiveLayerId(newId);
    return newId;
  }, [layers]);

  const removeLayer = useCallback((id: string) => {
    setLayers(prev => {
      const filtered = prev.filter(l => l.id !== id);
      if (filtered.length === 0) {
        // Always keep at least one layer
        return [{ id: "layer-1", name: "Layer 1", visible: true, locked: false, order: 0 }];
      }
      return filtered;
    });
    
    if (activeLayerId === id) {
      const remaining = layers.filter(l => l.id !== id);
      setActiveLayerId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [activeLayerId, layers]);

  const toggleLayerVisibility = useCallback((id: string) => {
    setLayers(prev =>
      prev.map(l => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  }, []);

  const toggleLayerLock = useCallback((id: string) => {
    setLayers(prev =>
      prev.map(l => (l.id === id ? { ...l, locked: !l.locked } : l))
    );
  }, []);

  const renameLayer = useCallback((id: string, name: string) => {
    setLayers(prev =>
      prev.map(l => (l.id === id ? { ...l, name } : l))
    );
  }, []);

  const reorderLayers = useCallback((startIndex: number, endIndex: number) => {
    setLayers(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      
      // Update order values
      return result.map((layer, index) => ({
        ...layer,
        order: index,
      }));
    });
  }, []);

  const duplicateLayer = useCallback((id: string) => {
    const layerToDuplicate = layers.find(l => l.id === id);
    if (!layerToDuplicate) return "";
    
    const newId = `layer-${Date.now()}`;
    const maxOrder = Math.max(...layers.map(l => l.order), -1);
    
    setLayers(prev => [
      ...prev,
      {
        ...layerToDuplicate,
        id: newId,
        name: `${layerToDuplicate.name} Copy`,
        order: maxOrder + 1,
      },
    ]);
    
    return newId;
  }, [layers]);

  const getLayerById = useCallback((id: string) => {
    return layers.find(l => l.id === id);
  }, [layers]);

  const isLayerVisible = useCallback((id: string) => {
    const layer = layers.find(l => l.id === id);
    return layer?.visible ?? true;
  }, [layers]);

  const isLayerLocked = useCallback((id: string) => {
    const layer = layers.find(l => l.id === id);
    return layer?.locked ?? false;
  }, [layers]);

  return {
    layers,
    activeLayerId,
    setActiveLayerId,
    addLayer,
    removeLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    renameLayer,
    reorderLayers,
    duplicateLayer,
    getLayerById,
    isLayerVisible,
    isLayerLocked,
  };
}
