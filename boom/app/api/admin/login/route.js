import { NextResponse } from 'next/server';
import { setAdminSessionCookie, validateAdminLogin } from '../../../lib/adminSession';

export async function POST(request) {
  try {
    const { username = '', password = '' } = await request.json();

    if (!validateAdminLogin(username, password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await setAdminSessionCookie();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 400 });
  }
}
