import { Howl } from 'howler';

// In a real app, you would host these files. For now, we use simple base64 or placeholders
// I will use short, reliable sound URLs for this MVP.

const SOUNDS = {
    init: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], volume: 0.3 }), // Sci-fi hum
    type: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'], volume: 0.1 }), // Click
    message: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'], volume: 0.2 }), // Incoming Data
    error: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'], volume: 0.4 }), // Alert
};

export const audioService = {
    play: (key: 'init' | 'type' | 'message' | 'error') => {
        try {
            SOUNDS[key].play();
            // Also trigger haptics if on mobile
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                if (key === 'error') navigator.vibrate(200);
                if (key === 'message') navigator.vibrate(50);
            }
        } catch (e) {
            // Silent fail if audio context blocked
        }
    }
};

