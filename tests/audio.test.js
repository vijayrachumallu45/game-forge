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
});
