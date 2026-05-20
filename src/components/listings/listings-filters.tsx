"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { FilterCombobox } from "@/components/filters/filter-combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EGYPT_CITIES, getCitiesForCountry } from "@/lib/geo/regions";
import {
  LISTING_CATEGORIES,
  LISTING_SORT_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  DEPARTURE_COUNTRIES,
} from "@/lib/listings/constants";
import { cn } from "@/lib/utils";

function filtersFromParams(searchParams: URLSearchParams) {
  return {
    q: searchParams.get("q") ?? "",
    origin: searchParams.get("origin") ?? "",
    origin_city: searchParams.get("origin_city") ?? "",
    destination: searchParams.get("destination") ?? "",
    category: searchParams.get("category") ?? "",
    service: searchParams.get("service") ?? "",
    sort: searchParams.get("sort") ?? "arrival_asc",
  };
}

type ListingsFiltersProps = {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterKey]
  );

  const [q, setQ] = useState(initial.q);
  const [origin, setOrigin] = useState(initial.origin);
  const [originCity, setOriginCity] = useState(initial.origin_city);
  const [destination, setDestination] = useState(initial.destination);
  const [category, setCategory] = useState(initial.category);
  const [service, setService] = useState(initial.service);
  const [sort, setSort] = useState(initial.sort);

  const countryOptions = useMemo(
    () =>
      DEPARTURE_COUNTRIES.map((c) => ({
        value: c.code,
        label: `${c.flag} ${c.name}`,
      })),
    []
  );

  const originCityOptions = useMemo(() => {
    const cities = origin ? getCitiesForCountry(origin) : [];
    return cities.map((city) => ({ value: city, label: city }));
  }, [origin]);

  const egyptCityOptions = useMemo(
    () => EGYPT_CITIES.map((city) => ({ value: city, label: city })),
    []
  );

  function applyFilters(values: ReturnType<typeof filtersFromParams>) {
    const params = new URLSearchParams(searchParams.toString());
    [
      "q",
      "origin",
      "origin_city",
      "destination",
      "category",
      "service",
      "sort",
      "page",
    ].forEach((key) => params.delete(key));
    Object.entries(values).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    startTransition(() => {
      const listingQs = params.toString();
      const path = listingQs ? `${basePath}?${listingQs}` : basePath;
      router.push(path, { scroll: false });
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyFilters({
      q,
      origin,
      origin_city: originCity,
      destination,
      category,
      service,
      sort,
    });
  }

  function handleReset() {
    setQ("");
    setOrigin("");
    setOriginCity("");
    setDestination("");
    setCategory("");
    setService("");
    setSort("arrival_asc");
    const params = new URLSearchParams(searchParams.toString());
    [
      "q",
      "origin",
      "origin_city",
      "destination",
      "category",
      "service",
      "sort",
      "page",
    ].forEach((key) => params.delete(key));
    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    });
  }

  function onOriginChange(code: string) {
    setOrigin(code);
    if (originCity && code) {
      const allowed = getCitiesForCountry(code);
      if (!allowed.some((c) => c === originCity)) setOriginCity("");
    }
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
        <FilterCombobox
          label="Departure country"
          value={origin}
          onChange={onOriginChange}
          options={countryOptions}
          placeholder="Type country (e.g. U for US)…"
        />
        <FilterCombobox
          label="Departure city"
          value={originCity}
          onChange={setOriginCity}
          options={originCityOptions}
          placeholder={
            origin
              ? "Type city in selected country…"
              : "Select a country first"
          }
          disabled={!origin || originCityOptions.length === 0}
        />
        <FilterCombobox
          label="Arrival city in Egypt"
          value={destination}
          onChange={setDestination}
          options={egyptCityOptions}
          placeholder="Type city (e.g. C for Cairo)…"
        />
        <Select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-2xl"
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
          className="rounded-2xl"
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
