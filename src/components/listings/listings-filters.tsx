"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  FeedFilterGrid,
  FeedFilterPanel,
} from "@/components/filters/feed-filter-panel";
import { FilterCombobox } from "@/components/filters/filter-combobox";
import { FilterSelect } from "@/components/filters/filter-select";
import { EGYPT_CITIES, getCitiesForCountry } from "@/lib/geo/regions";
import {
  LISTING_CATEGORIES,
  LISTING_SORT_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  DEPARTURE_COUNTRIES,
} from "@/lib/listings/constants";

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

  const actions = (
    <>
      <button
        type="submit"
        disabled={pending}
        className="feed-filter-btn-apply"
      >
        {pending ? "Applying…" : "Apply filters"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={handleReset}
        className="feed-filter-btn-reset"
      >
        Reset
      </button>
    </>
  );

  return (
    <form key={filterKey} onSubmit={handleSubmit} className={className}>
      <FeedFilterPanel actions={actions}>
        <input
          name="q"
          type="search"
          placeholder="Search cities or notes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="feed-filter-field w-full"
        />

        <FeedFilterGrid cols={3}>
          <FilterCombobox
            label="Departure country"
            value={origin}
            onChange={onOriginChange}
            options={countryOptions}
            emptyLabel="All departure countries"
            placeholder="All departure countries"
          />
          <FilterCombobox
            label="Arrival city"
            value={destination}
            onChange={setDestination}
            options={egyptCityOptions}
            emptyLabel="All arrival cities"
            placeholder="All arrival cities"
          />
          <FilterSelect
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Category"
          >
            <option value="">All categories</option>
            {LISTING_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </FilterSelect>
        </FeedFilterGrid>

        <FeedFilterGrid cols={3}>
          <FilterCombobox
            label="Departure city"
            value={originCity}
            onChange={setOriginCity}
            options={originCityOptions}
            emptyLabel="All departure cities"
            placeholder={
              origin ? "All departure cities" : "Select country first"
            }
            disabled={!origin || originCityOptions.length === 0}
          />
          <FilterSelect
            name="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            aria-label="Service"
          >
            <option value="">All services</option>
            {SERVICE_TYPE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            name="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort"
          >
            {LISTING_SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </FilterSelect>
        </FeedFilterGrid>
      </FeedFilterPanel>
    </form>
  );
}
