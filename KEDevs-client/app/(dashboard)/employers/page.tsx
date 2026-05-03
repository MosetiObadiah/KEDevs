import { redirect } from 'next/navigation';

export default function EmployersRedirectPage() {
  redirect('/profile/me');
}
