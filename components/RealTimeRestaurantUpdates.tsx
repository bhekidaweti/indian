'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Restaurant } from '@/types/restaurants';

interface RealTimeRestaurantUpdatesProps {
  onUpdate: (restaurant: Restaurant) => void;
}

export function RealTimeRestaurantUpdates({ onUpdate }: RealTimeRestaurantUpdatesProps) {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('restaurant-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'restaurants',
        },
        (payload) => {
          onUpdate(payload.new as Restaurant);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, onUpdate]);

  return null;
}