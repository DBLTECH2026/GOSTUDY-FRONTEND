/**
 * QR visual generado solo con SVG (sin dependencias). NO codifica datos
 * reales — es solo demostrativo. Genera un patrón pseudo-aleatorio
 * determinístico a partir del seed pasado, para que un mismo pago
 * siempre se vea igual.
 */
type FakeQRProps = {
  seed?: number;
  size?: number;
};

export function FakeQR({ seed = 42, size = 220 }: FakeQRProps) {
  // Pseudo-random determinístico
  const rng = makeRng(seed);

  const N = 25;
  const grid: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      grid[r][c] = rng() < 0.5;
    }
  }
  // 3 finder patterns
  drawFinder(grid, 0, 0);
  drawFinder(grid, 0, N - 7);
  drawFinder(grid, N - 7, 0);
  // Pequeño marcador inferior derecho (alignment-like)
  for (let r = N - 5; r < N - 2; r++) {
    for (let c = N - 5; c < N - 2; c++) {
      grid[r][c] = (r === N - 5 || r === N - 3) || (c === N - 5 || c === N - 3);
    }
  }

  const cs = size / N;

  return (
    <div className="bg-white p-3 rounded-md border border-border inline-block">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <rect width={size} height={size} fill="white" />
        {grid.flatMap((row, r) =>
          row.map((on, c) =>
            on ? (
              <rect
                key={`${r}-${c}`}
                x={c * cs}
                y={r * cs}
                width={cs}
                height={cs}
                fill="black"
              />
            ) : null,
          ),
        )}
      </svg>
    </div>
  );
}

function drawFinder(grid: boolean[][], rowOffset: number, colOffset: number) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const onBorder = r === 0 || r === 6 || c === 0 || c === 6;
      const onInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      grid[rowOffset + r][colOffset + c] = onBorder || onInner;
    }
  }
  // Limpiar separator (1 cell margin alrededor del finder)
  const N = grid.length;
  for (let i = 0; i < 8; i++) {
    if (rowOffset === 0) {
      if (colOffset + i < N) grid[7][colOffset + i] = false;
      if (colOffset === 0 && i < 8) grid[i][7] = false;
      if (colOffset === N - 7 && i < 8) grid[i][N - 8] = false;
    }
    if (rowOffset === N - 7) {
      if (colOffset + i < N) grid[N - 8][colOffset + i] = false;
      if (i < 8) grid[N - 8 + i]?.[7] !== undefined && (grid[N - 8 + i][7] = false);
    }
  }
}

function makeRng(seed: number): () => number {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
