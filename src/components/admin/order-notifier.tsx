'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Icon } from '@/components/ui/icon';
import { toast } from 'sonner';

const POLLING_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes interval as requested
const STORAGE_KEY = 'admin_order_sound_enabled';

/**
 * Plays the custom audio file (/sounds/order-ring.mp3) if present,
 * or falls back to a clean browser Web Audio chime.
 */
export function playOrderRingSound() {
  try {
    const audio = new Audio('/sounds/order-ring.mp3');
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback to synthesized audio if MP3 file is not found or blocked
        playSynthesizedChime();
      });
    }
  } catch {
    playSynthesizedChime();
  }
}

function playSynthesizedChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // 4-note ascending melody chime (pleasant alert ring)
    const notes = [
      { freq: 523.25, start: 0, duration: 0.2 },     // C5
      { freq: 659.25, start: 0.18, duration: 0.22 },  // E5
      { freq: 783.99, start: 0.38, duration: 0.25 },  // G5
      { freq: 1046.50, start: 0.60, duration: 0.45 }, // C6
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    });
  } catch (e) {
    console.warn('Audio playback not permitted or failed:', e);
  }
}

/**
 * Triggers Desktop Notification if browser tab is in background/minimized
 */
export function sendDesktopNotification(title: string, body: string, href?: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    const notif = new Notification(title, {
      body,
      icon: '/logo.webp',
      badge: '/logo.webp',
      tag: 'new-order-alert',
    });

    if (href) {
      notif.onclick = () => {
        window.focus();
        window.location.href = href;
      };
    }
  }
}

/**
 * Background hook/component that monitors incoming orders every 30 minutes
 */
export function OrderNotificationListener() {
  const isInitialized = useRef(false);
  const knownOrderIds = useRef<Set<string>>(new Set());

  const checkNewOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const items: any[] = data.items || [];

      if (!isInitialized.current) {
        // First load: Record all existing order IDs without alerting
        items.forEach((item) => {
          if (item.id) knownOrderIds.current.add(String(item.id));
        });
        isInitialized.current = true;
        return;
      }

      // Check for freshly arrived orders
      const newOrders = items.filter(
        (item) => item.id && !knownOrderIds.current.has(String(item.id))
      );

      if (newOrders.length > 0) {
        // Add new order IDs to tracked set
        newOrders.forEach((item) => knownOrderIds.current.add(String(item.id)));

        const isSoundOn = localStorage.getItem(STORAGE_KEY) !== 'false';

        // Play sound ring if sound is enabled
        if (isSoundOn) {
          playOrderRingSound();
        }

        // Trigger desktop notifications & subtle toasts
        newOrders.forEach((ord) => {
          const isLab = ord.type === 'lab_test' || ord.labTestName || ord.testDetails;
          const orderType = isLab ? 'Lab Test Booking' : 'Medicine Order';
          const title = `New ${orderType} Received! 🔔`;
          const body = `Order #${ord.orderNumber || ord.id} • ${ord.customerName || 'Customer'} • ₹${ord.total ?? ord.amount ?? 0}`;
          const link = isLab ? '/admin/lab-orders' : '/admin/medicine-orders';

          sendDesktopNotification(title, body, link);
          toast.success(`${title} - ${body}`, {
            duration: 6000,
            action: {
              label: 'View',
              onClick: () => {
                window.location.href = link;
              },
            },
          });
        });
      }
    } catch (err) {
      console.warn('Failed to check for new orders:', err);
    }
  }, []);

  useEffect(() => {
    // Initial fetch to record baseline orders
    checkNewOrders();

    // Set 30 minute recurring background interval
    const timer = setInterval(() => {
      checkNewOrders();
    }, POLLING_INTERVAL_MS);

    // Also check whenever admin switches back to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkNewOrders();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkNewOrders]);

  return null;
}

/**
 * Topbar Mute / Unmute Speaker Toggle Button
 */
export function OrderSoundToggle() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setSoundEnabled(saved !== 'false');
    }
  }, []);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem(STORAGE_KEY, String(nextState));

    if (nextState) {
      // Request Desktop Notification permission if not yet granted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      // Play a short preview chime so admin knows sound works
      playOrderRingSound();
      toast.success('Order ring sound enabled 🔔');
    } else {
      toast.info('Order ring sound muted 🔕');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleSound}
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition ${
        soundEnabled
          ? 'border-[#006872]/30 bg-[#d9eeee] text-[#006872] hover:bg-[#bce6e8]'
          : 'border-[#e4e2e1] bg-[#f5f3f3] text-[#6e797b] hover:bg-[#eae7e6]'
      }`}
      aria-label={soundEnabled ? 'Mute order notification sound' : 'Unmute order notification sound'}
      title={soundEnabled ? 'Order Sound: ON (Click to mute)' : 'Order Sound: OFF (Click to unmute)'}
    >
      <Icon name={soundEnabled ? 'volume_up' : 'volume_off'} className="text-[18px]" />
      {soundEnabled && (
        <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#006872] opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#006872]"></span>
        </span>
      )}
    </button>
  );
}
