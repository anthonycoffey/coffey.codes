/**
 * Samples particle positions along the edges of a Merkaba (Star Tetrahedron).
 * Two interlocking regular tetrahedra — one pointing up, one pointing down —
 * each inscribed in a sphere of the given radius.
 */
export function sampleMerkaba(radius: number, count: number): Float32Array {
  const r = radius

  // Constants for a regular tetrahedron inscribed in a unit sphere
  const sq8o9 = Math.sqrt(8 / 9)
  const sq2o9 = Math.sqrt(2 / 9)
  const sq2o3 = Math.sqrt(2 / 3)

  // Tetrahedron 1 — apex pointing up
  const t1: [number, number, number][] = [
    [0,           r,     0],
    [r * sq8o9,  -r / 3, 0],
    [-r * sq2o9, -r / 3, r * sq2o3],
    [-r * sq2o9, -r / 3, -r * sq2o3],
  ]

  // Tetrahedron 2 — apex pointing down (mirror of t1 through origin)
  const t2: [number, number, number][] = [
    [0,           -r,     0],
    [-r * sq8o9,  r / 3,  0],
    [r * sq2o9,   r / 3,  -r * sq2o3],
    [r * sq2o9,   r / 3,  r * sq2o3],
  ]

  // 6 edges per tetrahedron = 12 total
  const edges: [[number, number, number], [number, number, number]][] = [
    [t1[0], t1[1]], [t1[0], t1[2]], [t1[0], t1[3]],
    [t1[1], t1[2]], [t1[1], t1[3]], [t1[2], t1[3]],
    [t2[0], t2[1]], [t2[0], t2[2]], [t2[0], t2[3]],
    [t2[1], t2[2]], [t2[1], t2[3]], [t2[2], t2[3]],
  ]

  const positions = new Float32Array(count * 3)
  const perEdge = Math.floor(count / edges.length)
  let idx = 0

  for (const [a, b] of edges) {
    const n = idx + perEdge <= count ? perEdge : count - idx
    for (let i = 0; i < n; i++) {
      const t = n > 1 ? i / (n - 1) : 0.5
      positions[idx * 3]     = a[0] + (b[0] - a[0]) * t
      positions[idx * 3 + 1] = a[1] + (b[1] - a[1]) * t
      positions[idx * 3 + 2] = a[2] + (b[2] - a[2]) * t
      idx++
    }
  }

  // Fill any remainder along random edges
  while (idx < count) {
    const ei = Math.floor(Math.random() * edges.length)
    const [a, b] = edges[ei]
    const t = Math.random()
    positions[idx * 3]     = a[0] + (b[0] - a[0]) * t
    positions[idx * 3 + 1] = a[1] + (b[1] - a[1]) * t
    positions[idx * 3 + 2] = a[2] + (b[2] - a[2]) * t
    idx++
  }

  return positions
}
