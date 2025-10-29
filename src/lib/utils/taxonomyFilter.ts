import { slugify } from "@/lib/utils/textConverter";

type EntryWithTaxonomy = {
  data: Record<string, unknown>;
};

const taxonomyFilter = <T extends EntryWithTaxonomy>(
  posts: T[],
  name: string,
  key: string | undefined | null,
) =>
  posts.filter((post) => {
    const data = post.data as Record<string, unknown>;
    const field = data[name];

    if (!key || !Array.isArray(field)) {
      return false;
    }

    return field
      .filter((value): value is string => typeof value === "string")
      .map((value) => slugify(value))
      .includes(key);
  });

export default taxonomyFilter;
