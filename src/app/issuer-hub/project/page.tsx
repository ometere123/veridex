import { redirect } from 'next/navigation';

export default async function IssuerHubProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  redirect(id ? `/dossier/${id}` : '/issuer-hub');
}
