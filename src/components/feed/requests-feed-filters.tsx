"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  FeedFilterGrid,
  FeedFilterPanel,
} from "@/components/filters/feed-filter-panel";
import { FilterCombobox } from "@/components/filters/filter-combobox";
import { FilterSelect } from "@/components/filters/filter-select";
import { DEPARTURE_COUNTRIES } from "@/lib/listings/constants";
import { getCitiesForCountry } from "@/lib/geo/regions";
import {
  REQUEST_CATEGORIES,
  REQUEST_SORT_OPTIONS,
  REQUEST_URGENCY_OPTIONS,
} from "@/lib/requests/constants";

function filtersFromParams(searchParams: URLSearchParams) {
  return {
    req_q: searchParams.get("req_q") ?? "",
    req_category: searchParams.get("req_category") ?? "",
    req_urgency: searchParams.get("req_urgency") ?? "",
    req_origin: searchParams.get("req_origin") ?? "",
    req_city: searchParams.get("req_city") ?? "",
    req_sort: searchParams.get("req_sort") ?? "newest",
  };
}

type RequestsFeedFiltersProps = {
  basePath?: string;
  className?: string;
};

export function RequestsFeedFilters({
  basePath = "/",
  className,
}: RequestsFeedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const filterKey = searchParams.toString();

  const initial = useMemo(
    () => filtersFromParams(searchParams),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterKey]
  );

  const [reqQ, setReqQ] = useState(initial.req_q);
  const [reqCategory, setReqCategory] = useState(initial.req_category);
  const [reqUrgency, setReqUrgency] = useState(initial.req_urgency);
  const [reqOrigin, setReqOrigin] = useState(initial.req_origin);
  const [reqCity, setReqCity] = useState(initial.req_city);
  const [reqSort, setReqSort] = useState(initial.req_sort);

  const countryOptions = useMemo(
    () =>
      DEPARTURE_COUNTRIES.map((c) => ({
        value: c.code,
        label: `${c.flag} ${c.name}`,
      })),
    []
  );

  const cityOptions = useMemo(() => {
    const cities = reqOrigin ? getCitiesForCountry(reqOrigin) : [];
    return cities.map((city) => ({ value: city, label: city }));
  }, [reqOrigin]);

  function apply(values: ReturnType<typeof filtersFromParams>) {
    const params = new URLSearchParams(searchParams.toString());
    [
      "req_q",
      "req_category",
      "req_urgency",
      "req_origin",
      "req_city",
      "req_sort",
    ].forEach((key) => params.delete(key));
    Object.entries(values).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    apply({
      req_q: reqQ,
      req_category: reqCategory,
      req_urgency: reqUrgency,
      req_origin: reqOrigin,
      req_city: reqCity,
      req_sort: reqSort,
    });
  }

  function handleReset() {
    setReqQ("");
    setReqCategory("");
    setReqUrgency("");
    setReqOrigin("");
    setReqCity("");
    setReqSort("newest");
    const params = new URLSearchParams(searchParams.toString());
    [
      "req_q",
      "req_category",
      "req_urgency",
      "req_origin",
      "req_city",
      "req_sort",
    ].forEach((key) => params.delete(key));
    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    });
  }

  function onOriginChange(code: string) {
    setReqOrigin(code);
    if (reqCity && code) {
      const allowed = getCitiesForCountry(code);
      if (!allowed.some((c) => c === reqCity)) setReqCity("");
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
          name="req_q"
          type="search"
          placeholder="Search title, description, or city…"
          value={reqQ}
          onChange={(e) => setReqQ(e.target.value)}
          className="feed-filter-field w-full"
        />

        <FeedFilterGrid cols={3}>
          <FilterCombobox
            label="Origin country"
            value={reqOrigin}
            onChange={onOriginChange}
            options={countryOptions}
            emptyLabel="All origin countries"
            placeholder="All origin countries"
          />
          <FilterCombobox
            label="Origin city"
            value={reqCity}
            onChange={setReqCity}
            options={cityOptions}
            emptyLabel="All origin cities"
            placeholder={reqOrigin ? "All origin cities" : "Select country first"}
            disabled={!reqOrigin || cityOptions.length === 0}
          />
          <FilterSelect
            name="req_category"
            value={reqCategory}
            onChange={(e) => setReqCategory(e.target.value)}
            aria-label="Category"
          >
            <option value="">All categories</option>
            {REQUEST_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </FilterSelect>
        </FeedFilterGrid>

        <FeedFilterGrid cols={2}>
          <FilterSelect
            name="req_urgency"
            value={reqUrgency}
            onChange={(e) => setReqUrgency(e.target.value)}
            aria-label="Urgency"
          >
            <option value="">All urgency levels</option>
            {REQUEST_URGENCY_OPTIONS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            name="req_sort"
            value={reqSort}
            onChange={(e) => setReqSort(e.target.value)}
            aria-label="Sort"
          >
            {REQUEST_SORT_OPTIONS.map((s) => (
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
