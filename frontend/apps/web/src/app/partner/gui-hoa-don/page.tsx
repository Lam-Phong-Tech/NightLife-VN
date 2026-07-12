import { redirect } from 'next/navigation';

export default function PartnerBillSubmitPage() {
  redirect('/partner?panel=bill');
  return null;
}
