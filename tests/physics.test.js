import { describe, it, expect } from 'vitest';
import { QuadTree } from '../src/engine/physics/QuadTree';
import { RigidBody2D } from '../src/engine/physics/RigidBody2D';

describe('Physics & QuadTree Systems', () => {
  it('should initialize RigidBody2D', () => {
    const body = new RigidBody2D();
    expect(body.id).toBeDefined();
    expect(body.state.running).toBe(true);
  });

  it('should compute physics steps', () => {
    const quadTree = new QuadTree();
    const result = quadTree.computeStep_1(0.016, 1.0, {});
    expect(result.valid).toBe(true);
  });
});
