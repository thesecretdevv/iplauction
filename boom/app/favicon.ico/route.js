import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

export async function GET() {
  const iconPath = path.join(process.cwd(), 'public', 'assets', 'favicon.png');
  const icon = await readFile(iconPath);

  return new Response(icon, {
    headers: {
      'Content-Type': 'image/x-icon',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
}
