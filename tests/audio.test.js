import { describe, it, expect } from 'vitest';
import { sound } from '../src/utils/soundEngine';
import { AudioSynthesizer } from '../src/engine/audio/AudioSynthesizer';

describe('Audio Synthesizer Engine', () => {
  it('should toggle sound muting state', () => {
    const isMuted = sound.toggleMute();
    expect(isMuted).toBe(true);
    sound.toggleMute(); // restore
  });

  it('should compute synthesizer steps', () => {
    const synth = new AudioSynthesizer();
    const res = synth.computeStep_10();
    expect(res.step).toBe(10);
    expect(res.valid).toBe(true);
  });

  it('should manage master volume and clamp within 0 to 1', () => {
    expect(sound.getMasterVolume()).toBe(1.0);
    expect(sound.setMasterVolume(0.5)).toBe(0.5);
    expect(sound.getMasterVolume()).toBe(0.5);

    sound.setMasterVolume(1.5);
    expect(sound.getMasterVolume()).toBe(1.0);

    sound.setMasterVolume(-0.2);
    expect(sound.getMasterVolume()).toBe(0.0);

    sound.setMasterVolume(1.0); // restore default
  });
});

