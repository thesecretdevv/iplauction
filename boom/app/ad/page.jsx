import AdminConsole from './AdminConsole';
import { isAdminAuthenticated } from '../lib/adminSession';

export const metadata = {
  title: 'Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  return <AdminConsole initialAuthenticated={authenticated} />;
}
