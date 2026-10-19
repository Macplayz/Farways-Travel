import { redirect } from 'next/navigation';

export default function FlightsRedirectPage() {
  redirect('/?tab=flights');
}
