// similer products
type ItemWithCategories = {
  slug: string;
  data: {
    categories?: string[];
  };
};

const similerItems = <T extends ItemWithCategories>(
  currentItem: T,
  allItems: T[],
  slug: string,
) => {
  const categories = Array.isArray(currentItem.data.categories)
    ? currentItem.data.categories
    : [];

  const itemsByCategory = allItems.filter((item) => {
    if (!Array.isArray(item.data.categories)) {
      return false;
    }

    return categories.some((category) =>
      item.data.categories?.includes(category),
    );
  });

  return itemsByCategory.filter((item) => item.slug !== slug);
};

export default similerItems;
