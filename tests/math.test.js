import { describe, it, expect } from 'vitest';
import { Vector2D } from '../src/engine/math/Vector2D';
import { Vector3D } from '../src/engine/math/Vector3D';

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
});
