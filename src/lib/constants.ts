export const SITE = {
  name: "Shiply",
  tagline: "Egypt",
  fullName: "Shiply Egypt",
  description:
    "A premium marketplace connecting travelers with customers who want products brought from abroad into Egypt.",
} as const;

export const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/travelers", label: "Find travelers" },
  { href: "/requests", label: "Post a request" },
  { href: "/trust", label: "Trust & safety" },
] as const;

export const FOOTER_LINKS = {
  product: [
    { href: "/travelers", label: "Browse travelers" },
    { href: "/requests", label: "Post a request" },
    { href: "/how-it-works", label: "How it works" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/trust", label: "Trust & safety" },
    { href: "/contact", label: "Contact" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ],
} as const;

export const TRUST_FEATURES = [
  "Passport & flight verified",
  "Secure deposit protection",
  "Delivery guarantee",
  "Dual ratings & reviews",
  "Receipt verification",
] as const;
