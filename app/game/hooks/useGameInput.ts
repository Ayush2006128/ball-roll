'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { InputState } from '../engine/types';

const SWIPE_THRESHOLD = 40;

export function useGameInput() {
  const [inputState, setInputState] = useState<InputState>({
    isPressed: false,
    swipeDirection: null,
  });
  
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const swipeProcessedRef = useRef(false);
  
  const consumeSwipe = useCallback(() => {
    setInputState(prev => ({ ...prev, swipeDirection: null }));
  }, []);
  
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      swipeProcessedRef.current = false;
      setInputState(prev => ({ ...prev, isPressed: true }));
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!touchStartRef.current || swipeProcessedRef.current) return;
      
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        swipeProcessedRef.current = true;
        setInputState(prev => ({
          ...prev,
          swipeDirection: dx > 0 ? 'right' : 'left',
        }));
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      touchStartRef.current = null;
      setInputState(prev => ({ ...prev, isPressed: false }));
    };
    
    // Mouse fallback for desktop
    const handleMouseDown = (e: MouseEvent) => {
      touchStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
      swipeProcessedRef.current = false;
      setInputState(prev => ({ ...prev, isPressed: true }));
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!touchStartRef.current || swipeProcessedRef.current) return;
      
      const dx = e.clientX - touchStartRef.current.x;
      const dy = e.clientY - touchStartRef.current.y;
      
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        swipeProcessedRef.current = true;
        setInputState(prev => ({
          ...prev,
          swipeDirection: dx > 0 ? 'right' : 'left',
        }));
      }
    };
    
    const handleMouseUp = () => {
      touchStartRef.current = null;
      setInputState(prev => ({ ...prev, isPressed: false }));
    };
    
    // Keyboard support
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        setInputState(prev => ({ ...prev, isPressed: true }));
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        setInputState(prev => ({ ...prev, swipeDirection: 'left' }));
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setInputState(prev => ({ ...prev, swipeDirection: 'right' }));
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        setInputState(prev => ({ ...prev, isPressed: false }));
      }
    };
    
    const el = document;
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: false });
    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('keydown', handleKeyDown);
    el.addEventListener('keyup', handleKeyUp);
    
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('keydown', handleKeyDown);
      el.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  return { inputState, consumeSwipe };
}
