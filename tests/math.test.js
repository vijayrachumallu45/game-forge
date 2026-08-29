import { describe, it, expect } from 'vitest';
import { Vector2D } from '../src/engine/math/Vector2D';
import { Vector3D } from '../src/engine/math/Vector3D';
import { FastMath } from '../src/engine/math/FastMath';

describe('Vector & Math Engine Unit Tests', () => {
  it('should initialize Vector2D instance', () => {
    const v = new Vector2D();
    expect(v.id).toBeDefined();
    expect(v.state.initialized).toBe(true);
  });

  it('should compute Vector2D steps', () => {
    const v = new Vector2D();
    const res = v.computeStep_1(0.016, 1.0, {});
    expect(res.step).toBe(1);
    expect(res.valid).toBe(true);
  });

  it('should initialize Vector3D instance', () => {
    const v3 = new Vector3D();
    expect(v3.id).toBeDefined();
    expect(v3.state.running).toBe(true);
  });

  it('should compute FastMath utility methods correctly', () => {
    expect(FastMath.clamp(15, 0, 10)).toBe(10);
    expect(FastMath.clamp(-5, 0, 10)).toBe(0);
    expect(FastMath.clamp(5, 0, 10)).toBe(5);

    expect(FastMath.lerp(0, 100, 0.5)).toBe(50);
    expect(FastMath.lerp(10, 20, 0)).toBe(10);
    expect(FastMath.lerp(10, 20, 1)).toBe(20);

    expect(FastMath.degToRad(180)).toBeCloseTo(Math.PI, 5);
    expect(FastMath.radToDeg(Math.PI)).toBeCloseTo(180, 5);
  });
});

