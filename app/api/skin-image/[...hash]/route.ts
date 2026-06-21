import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ hash: string[] }> }
) {
  const { hash } = await params;
  const hashPath = hash.join('/');
  const url = `https://community.cloudflare.steamstatic.com/economy/image/${hashPath}`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get('content-type') ?? 'image/png';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
