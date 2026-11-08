import { CanvasTexture, SRGBColorSpace } from 'three';
import type { SignPainter } from './signage';

// Texto maior que esta fração da largura é reduzido até caber, sem cortar o nome nem o título.
const MAX_TEXT_WIDTH = 0.9;
const LINE_GAP = 0.25;
const LED_PITCH_PX = 4;

/** Pintor das placas no navegador: texto em canvas 2D com fonte do sistema, sem arquivos novos. */
export function createSignPainter(maxAnisotropy: number): SignPainter {
  return (spec) => {
    const canvas = document.createElement('canvas');
    canvas.width = spec.widthPx;
    canvas.height = spec.heightPx;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.fillStyle = spec.background;
    context.fillRect(0, 0, spec.widthPx, spec.heightPx);
    const sizes = spec.lines.map(({ text, size }) => {
      let fontPx = size * spec.heightPx;
      context.font = `700 ${String(fontPx)}px system-ui, sans-serif`;
      const width = context.measureText(text).width;
      if (width > spec.widthPx * MAX_TEXT_WIDTH) fontPx *= (spec.widthPx * MAX_TEXT_WIDTH) / width;
      return fontPx;
    });
    const total =
      sizes.reduce((sum, fontPx) => sum + fontPx, 0) +
      Math.max(0, sizes.length - 1) * LINE_GAP * (sizes[0] ?? 0);
    let y = (spec.heightPx - total) / 2;
    context.textAlign = 'center';
    context.textBaseline = 'top';
    spec.lines.forEach(({ text, color }, index) => {
      const fontPx = sizes[index] ?? 0;
      context.font = `700 ${String(fontPx)}px system-ui, sans-serif`;
      context.fillStyle = color;
      context.shadowColor = color;
      context.shadowBlur = fontPx * 0.35;
      context.fillText(text, spec.widthPx / 2, y);
      y += fontPx * (1 + LINE_GAP);
    });
    context.shadowBlur = 0;
    if (spec.ledGrid) {
      context.fillStyle = 'rgb(0 0 0 / 0.38)';
      for (let x = 0; x < spec.widthPx; x += LED_PITCH_PX) context.fillRect(x, 0, 1, spec.heightPx);
      for (let row = 0; row < spec.heightPx; row += LED_PITCH_PX)
        context.fillRect(0, row, spec.widthPx, 1);
    }
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = maxAnisotropy;
    return texture;
  };
}
