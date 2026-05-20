"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DEPARTURE_COUNTRIES } from "@/lib/listings/constants";
import {
  REQUEST_CATEGORIES,
  REQUEST_SORT_OPTIONS,
  REQUEST_URGENCY_OPTIONS,
} from "@/lib/requests/constants";
import { cn } from "@/lib/utils";

function filtersFromParams(searchParams: URLSearchParams) {
  return {
    req_q: searchParams.get("req_q") ?? "",
    req_category: searchParams.get("req_category") ?? "",
    req_urgency: searchParams.get("req_urgency") ?? "",
    req_origin: searchParams.get("req_origin") ?? "",
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
  const [reqSort, setReqSort] = useState(initial.req_sort);

  function apply(values: ReturnType<typeof filtersFromParams>) {
    const params = new URLSearchParams(searchParams.toString());
    ["req_q", "req_category", "req_urgency", "req_origin", "req_sort"].forEach(
      (key) => params.delete(key)
    );
    Object.entries(values).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    apply({
      req_q: reqQ,
      req_category: reqCategory,
      req_urgency: reqUrgency,
      req_origin: reqOrigin,
      req_sort: reqSort,
    });
  }

  function handleReset() {
    setReqQ("");
    setReqCategory("");
    setReqUrgency("");
    setReqOrigin("");
    setReqSort("newest");
    const params = new URLSearchParams(searchParams.toString());
    ["req_q", "req_category", "req_urgency", "req_origin", "req_sort"].forEach(
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
          name="req_q"
          placeholder="Search title, description, or city…"
          value={reqQ}
          onChange={(e) => setReqQ(e.target.value)}
          className="h-11 rounded-2xl md:col-span-2 lg:col-span-3"
        />
        <Select
          name="req_category"
          value={reqCategory}
          onChange={(e) => setReqCategory(e.target.value)}
          className="rounded-2xl"
        >
          <option value="">All categories</option>
          {REQUEST_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
        <Select
          name="req_urgency"
          value={reqUrgency}
          onChange={(e) => setReqUrgency(e.target.value)}
          className="rounded-2xl"
        >
          <option value="">All urgency levels</option>
          {REQUEST_URGENCY_OPTIONS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </Select>
        <Select
          name="req_origin"
          value={reqOrigin}
          onChange={(e) => setReqOrigin(e.target.value)}
          className="rounded-2xl"
        >
          <option value="">All origin countries</option>
          {DEPARTURE_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </Select>
        <Select
          name="req_sort"
          value={reqSort}
          onChange={(e) => setReqSort(e.target.value)}
          className="rounded-2xl"
        >
          {REQUEST_SORT_OPTIONS.map((s) => (
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
