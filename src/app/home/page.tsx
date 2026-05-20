import { redirect } from "next/navigation";

type HomePageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

/** Legacy `/home` URL — dashboard lives at `/`. */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) qs.set(key, value);
  });
  const query = qs.toString();
  redirect(query ? `/?${query}` : "/");
}
