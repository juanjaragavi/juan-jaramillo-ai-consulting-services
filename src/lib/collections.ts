import type { collections } from "@/content/config";

export type CollectionKey = keyof typeof collections;

export const BLOG_COLLECTION = "blog" as const satisfies CollectionKey;
