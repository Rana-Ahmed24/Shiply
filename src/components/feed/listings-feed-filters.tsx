"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  ARRIVAL_CITIES,
  DEPARTURE_COUNTRIES,
  LISTING_CATEGORIES,
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

type ListingsFeedFiltersProps = {
  /** Base path for filter navigation (e.g. `/` or `/travelers`) */
  basePath?: string;
  className?: string;
};

export function ListingsFeedFilters({
  basePath = "/",
  className,
}: ListingsFeedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const filterKey = searchParams.toString();

  const initial = useMemo(
    () => filtersFromParams(searchParams),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterKey]
  );

  const [q, setQ] = useState(initial.q);
  const [origin, setOrigin] = useState(initial.origin);
  const [destination, setDestination] = useState(initial.destination);
  const [category, setCategory] = useState(initial.category);
  const [service, setService] = useState(initial.service);
  const [sort, setSort] = useState(initial.sort);

  function apply(values: ReturnType<typeof filtersFromParams>) {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    startTransition(() => {
      const qs = params.toString();
      const path = qs ? `${basePath}?${qs}` : basePath;
      router.push(path);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    apply({ ...initial, q, origin, destination, category, service });
  }

  const quickTabs = [
    { label: "All travelers", service: "" },
    { label: "Shop & Ship", service: "shop_and_ship" },
    { label: "Ship Only", service: "ship_only" },
  ] as const;

  return (
    <div className={cn("space-y-4", className)}>
      <form onSubmit={handleSubmit} className="shiply-search-bar">
        <Search className="ml-1 size-4 shrink-0 text-brand-muted" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by country, city, or item type…"
          className="min-w-[12rem] flex-1 bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-brand-muted"
        />
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 w-auto min-w-[9rem] rounded-lg border-border/80 bg-card text-xs"
          aria-label="Category"
        >
          <option value="">All categories</option>
          {LISTING_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
        <Select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="hidden h-9 w-auto min-w-[8rem] rounded-lg border-border/80 bg-card text-xs sm:block"
          aria-label="Destination"
        >
          <option value="">All cities</option>
          {ARRIVAL_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>
        <Button
          type="submit"
          disabled={pending}
          size="sm"
          className="rounded-lg bg-brand-gold px-5 text-xs font-medium text-brand-navy hover:bg-brand-gold-light"
        >
          {pending ? "…" : "Search"}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {quickTabs.map((tab) => {
          const active = service === tab.service;
          return (
            <button
              key={tab.label}
              type="button"
              className={cn(
                "shiply-filter-tab",
                active && "shiply-filter-tab-active"
              )}
              onClick={() => {
                setService(tab.service);
                apply({
                  ...initial,
                  q,
                  origin,
                  destination,
                  category,
                  service: tab.service,
                });
              }}
            >
              {tab.label}
            </button>
          );
        })}
        <button
          type="button"
          className={cn(
            "shiply-filter-tab",
            origin === "US" && "shiply-filter-tab-active"
          )}
          onClick={() => {
            const next = origin === "US" ? "" : "US";
            setOrigin(next);
            apply({ ...initial, q, origin: next, destination, category, service });
          }}
        >
          USA → Egypt
        </button>
        <button
          type="button"
          className={cn(
            "shiply-filter-tab",
            sort === "newest" && "shiply-filter-tab-active"
          )}
          onClick={() => {
            const next = sort === "newest" ? "arrival_asc" : "newest";
            setSort(next);
            apply({
              ...initial,
              q,
              origin,
              destination,
              category,
              service,
              sort: next,
            });
          }}
        >
          Newest
        </button>
      </div>

      <details className="group text-sm">
        <summary className="cursor-pointer text-brand-muted hover:text-foreground">
          More filters
        </summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="rounded-lg text-xs"
          >
            <option value="">All departure countries</option>
            {DEPARTURE_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </Select>
          <Select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="rounded-lg text-xs sm:hidden"
          >
            <option value="">All arrival cities</option>
            {ARRIVAL_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
          <Select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="rounded-lg text-xs"
          >
            <option value="">All services</option>
            {SERVICE_TYPE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => {
              setQ("");
              setOrigin("");
              setDestination("");
              setCategory("");
              setService("");
              startTransition(() => router.push(basePath));
            }}
          >
            Reset
          </Button>
        </div>
      </details>
    </div>
  );
}
