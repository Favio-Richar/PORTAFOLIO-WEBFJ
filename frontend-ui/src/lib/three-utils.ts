import * as THREE from "three";

/**
 * Create particle system geometry
 */
export function createParticleGeometry(count: number, spread: number) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // Positions
        positions[i3] = (Math.random() - 0.5) * spread;
        positions[i3 + 1] = (Math.random() - 0.5) * spread;
        positions[i3 + 2] = (Math.random() - 0.5) * spread;

        // Colors (gradient from primary to white)
        color.setHSL(0.55 + Math.random() * 0.1, 0.8, 0.6 + Math.random() * 0.2);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return geometry;
}

/**
 * Get device performance tier
 */
export function getPerformanceTier(): "high" | "medium" | "low" {
    if (typeof window === "undefined") return "medium";

    // Check for device memory API
    const memory = (navigator as any).deviceMemory;
    if (memory) {
        if (memory >= 8) return "high";
        if (memory >= 4) return "medium";
        return "low";
    }

    // Fallback: check hardware concurrency
    const cores = navigator.hardwareConcurrency || 4;
    if (cores >= 8) return "high";
    if (cores >= 4) return "medium";
    return "low";
}

/**
 * Optimize particle count based on device
 */
export function getOptimalParticleCount(): number {
    const tier = getPerformanceTier();
    switch (tier) {
        case "high":
            return 500;
        case "medium":
            return 300;
        case "low":
            return 150;
    }
}
