import { redirect } from 'next/navigation';

export default function PartnerBillSubmitPage() {
  redirect('/partner/activity/new-bill');
  return null;
}
