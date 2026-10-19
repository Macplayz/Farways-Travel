import { redirect } from 'next/navigation';

export default function StaysRedirectPage() {
  redirect('/?tab=stays');
}
