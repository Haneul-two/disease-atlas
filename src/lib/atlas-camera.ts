type Box = { x: number; y: number; width: number; height: number };

// Place graph bounds inside the unobscured canvas, not behind a floating panel.
export function viewportForArea(bounds: Box, area: Box, maxZoom = 1.2) {
  const padding = 28;
  const width = Math.max(1, area.width - padding * 2);
  const height = Math.max(1, area.height - padding * 2);
  const zoom = Math.max(
    0.2,
    Math.min(
      maxZoom,
      width / Math.max(1, bounds.width),
      height / Math.max(1, bounds.height),
    ),
  );
  return {
    x: area.x + area.width / 2 - (bounds.x + bounds.width / 2) * zoom,
    y: area.y + area.height / 2 - (bounds.y + bounds.height / 2) * zoom,
    zoom,
  };
}
