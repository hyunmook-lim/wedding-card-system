"use client";

import { type ElementType, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TypographyVariant = "h1" | "h2" | "h3" | "body" | "caption" | "highlight" | "display" | "overlay-title" | "overlay-body";

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: ElementType;
}

const ELEMENT_TAGS: Record<TypographyVariant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  body: "p",
  caption: "span",
  highlight: "span",
  display: "h1",
  "overlay-title": "h2",
  "overlay-body": "p",
};

export function Typography({
  variant = "body",
  as,
  className,
  children,
  ...props
}: TypographyProps) {
  const Tag = as || ELEMENT_TAGS[variant] || "p";

  return (
    <Tag
      className={cn(getVariantClasses(variant), className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

function getVariantClasses(variant: TypographyVariant): string {
  switch (variant) {
    case "h1":
      return "text-3xl font-bold tracking-tight text-gray-900 leading-tight";
    case "h2":
      return "text-2xl font-semibold text-gray-800 leading-snug";
    case "h3":
      return "text-xl font-medium text-gray-800";
    case "body":
      return "text-base text-gray-600 leading-relaxed";
    case "caption":
      return "text-sm text-gray-500";
    case "highlight":
      return "text-base font-medium text-rose-500";
    case "display":
      return "text-6xl font-serif text-gray-900 leading-tight";
    case "overlay-title":
      return "text-3xl font-serif mb-4 drop-shadow-md text-white";
    case "overlay-body":
      return "text-lg font-light leading-relaxed whitespace-pre-line drop-shadow-md opacity-90 text-white";
    default:
      return "";
  }
}
