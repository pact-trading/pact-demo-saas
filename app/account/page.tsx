import { redirect } from 'next/navigation';

/** Old address of the billing page. */
export default async function Account({ searchParams }: { searchParams: Promise<{ subscription?: string }> }) {
  const { subscription } = await searchParams;
  redirect(subscription ? `/app/billing?subscription=${encodeURIComponent(subscription)}` : '/app/billing');
}
