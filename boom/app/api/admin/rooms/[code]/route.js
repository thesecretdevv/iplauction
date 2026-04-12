import { NextResponse } from 'next/server';
import { adminFetch, isAdminAuthenticated } from '../../../../lib/adminSession';

export async function DELETE(_request, { params }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const code = params?.code ? encodeURIComponent(String(params.code).toUpperCase()) : '';
  if (!code) {
    return NextResponse.json({ error: 'Missing room code' }, { status: 400 });
  }

  const response = await adminFetch(`/api/admin/rooms/${code}`, { method: 'DELETE' });
  const data = await response.json().catch(() => ({ error: 'Delete failed' }));
  return NextResponse.json(data, { status: response.status });
}
