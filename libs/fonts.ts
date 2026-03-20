import { Font } from '@react-pdf/renderer';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read font file and convert to base64
const fontPath = join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf');
const fontBuffer = readFileSync(fontPath);
const fontBase64 = fontBuffer.toString('base64');

// Register font for Vietnamese Unicode support
Font.register({
  family: 'Roboto',
  src: `data:font/truetype;charset=utf-8;base64,${fontBase64}`,
});

export const ROBOTO_FONT_FAMILY = 'Roboto';
