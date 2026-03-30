'use client';

import { useRef, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

export function useSocket() {
    const sock = useRef(null);

    useEffect(() => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://bidwicket.onrender.com";
        console.log("Connecting to Auction Server:", backendUrl);
        sock.current = io(backendUrl, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 500,
            reconnectionDelayMax: 3000,
            timeout: 10000,
        });

        sock.current.on('connect', () => console.log('[Socket] Connected:', sock.current.id));
        sock.current.on('disconnect', reason => {
            if (reason === 'io client disconnect') {
                console.log('[Socket] Disconnected:', reason);
                return;
            }
            console.warn('[Socket] Disconnected:', reason);
        });
        sock.current.on('connect_error', err => console.warn('[Socket] Error:', err.message));

        return () => { sock.current?.disconnect(); };
    }, []);

    const emit = useCallback((ev, data, cb) => {
        if (typeof data === 'function' && cb === undefined) {
            sock.current?.emit(ev, data);
            return;
        }
        sock.current?.emit(ev, data, cb);
    }, []);

    const on = useCallback((ev, fn) => {
        sock.current?.on(ev, fn);
        return () => sock.current?.off(ev, fn);
    }, []);

    return { emit, on, socket: sock };
}

// Timer beep using Web Audio API
let audioCtx = null;
export function playPulse() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 880;
        osc.type = "square";
        gain.gain.value = 0.15;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) { /* ignore audio errors */ }
}

export function playSaleSound(isSold = true) {
    try {
        const audio = new Audio(isSold ? '/assets/tadaa.mp3' : '/assets/fahhh.mp3');
        audio.volume = 0.6;
        audio.play().catch(e => console.warn("Audio play failed:", e));
    } catch (e) { }
}
