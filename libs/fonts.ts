import { Font } from '@react-pdf/renderer';
import { join } from 'path';

// Register font for Vietnamese Unicode support using file path
// This avoids ENAMETOOLONG error from large base64 strings
const fontPath = join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf');

Font.register({
  family: 'Roboto',
  src: fontPath,
});

export const ROBOTO_FONT_FAMILY = 'Roboto';
