import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPulse(score: number): string {
  if (score > 75) return "Electric";
  if (score > 60) return "Tense";
  if (score < 40) return "Quiet";
  if (score < 25) return "Frustrated";
  return "Stable";
}

export async function playPCM(base64: string, sampleRate = 24000) {
  if (!base64) return;
  
  try {
    const binary = atob(base64);
    const audioData = new Int16Array(binary.length / 2);
    for (let i = 0; i < audioData.length; i++) {
        audioData[i] = binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8);
    }
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    const buffer = audioContext.createBuffer(1, audioData.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < audioData.length; i++) {
        channelData[i] = audioData[i] / 32768.0;
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (err) {
    console.error("Audio playback error:", err);
  }
}
