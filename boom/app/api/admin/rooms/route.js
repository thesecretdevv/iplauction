import { NextResponse } from 'next/server';
import { adminFetch, isAdminAuthenticated } from '../../../lib/adminSession';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await adminFetch('/api/admin/rooms');
  const data = await response.json().catch(() => ({ error: 'Failed to load rooms' }));
  return NextResponse.json(data, { status: response.status });
}
