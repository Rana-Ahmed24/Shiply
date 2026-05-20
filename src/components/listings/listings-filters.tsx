"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  ARRIVAL_CITIES,
  DEPARTURE_COUNTRIES,
  LISTING_CATEGORIES,
  LISTING_SORT_OPTIONS,
  SERVICE_TYPE_OPTIONS,
} from "@/lib/listings/constants";
import { cn } from "@/lib/utils";

function filtersFromParams(searchParams: URLSearchParams) {
  return {
    q: searchParams.get("q") ?? "",
    origin: searchParams.get("origin") ?? "",
    destination: searchParams.get("destination") ?? "",
    category: searchParams.get("category") ?? "",
    service: searchParams.get("service") ?? "",
    sort: searchParams.get("sort") ?? "arrival_asc",
  };
}

type ListingsFiltersProps = {
  /** Where filter navigation applies (e.g. `/travelers` or `/`) */
  basePath?: string;
  className?: string;
};

export function ListingsFilters({
  basePath = "/travelers",
  className,
}: ListingsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const filterKey = searchParams.toString();

  const initial = useMemo(
    () => filtersFromParams(searchParams),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remount when URL filters change
    [filterKey]
  );

  const [q, setQ] = useState(initial.q);
  const [origin, setOrigin] = useState(initial.origin);
  const [destination, setDestination] = useState(initial.destination);
  const [category, setCategory] = useState(initial.category);
  const [service, setService] = useState(initial.service);
  const [sort, setSort] = useState(initial.sort);

  function applyFilters(values: ReturnType<typeof filtersFromParams>) {
    const params = new URLSearchParams(searchParams.toString());
    ["q", "origin", "destination", "category", "service", "sort", "page"].forEach(
      (key) => params.delete(key)
    );
    Object.entries(values).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    startTransition(() => {
      const listingQs = params.toString();
      const path = listingQs ? `${basePath}?${listingQs}` : basePath;
      router.push(path);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyFilters({ q, origin, destination, category, service, sort });
  }

  function handleReset() {
    setQ("");
    setOrigin("");
    setDestination("");
    setCategory("");
    setService("");
    setSort("arrival_asc");
    const params = new URLSearchParams(searchParams.toString());
    ["q", "origin", "destination", "category", "service", "sort", "page"].forEach(
      (key) => params.delete(key)
    );
    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath);
    });
  }

  return (
    <form
      key={filterKey}
      className={cn(
        "space-y-4 rounded-2xl border border-border/60 bg-card p-4 md:p-5",
        className
      )}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Input
          name="q"
          placeholder="Search cities or notes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-11 rounded-2xl md:col-span-2 lg:col-span-3"
        />
        <Select
          name="origin"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="rounded-2xl"
        >
          <option value="">All departure countries</option>
          {DEPARTURE_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </Select>
        <Select
          name="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        >
          <option value="">All arrival cities</option>
          {ARRIVAL_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>
        <Select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {LISTING_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
        <Select
          name="service"
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          <option value="">All services</option>
          {SERVICE_TYPE_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
        <Select name="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          {LISTING_SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={pending}
          className="rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
        >
          {pending ? "Applying…" : "Apply filters"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl"
          disabled={pending}
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
