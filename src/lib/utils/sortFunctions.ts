type WithDate = { data: { date?: string | number | Date } };
type WithWeight = { data: { weight?: number | string } };

const toTimestamp = (value: string | number | Date | undefined): number => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? 0 : value.getTime();
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

const toNumber = (value: number | string | undefined): number => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

// sort by date
export const sortByDate = <T extends WithDate>(array: T[]): T[] => {
  return [...array].sort(
    (a, b) => toTimestamp(b.data.date) - toTimestamp(a.data.date),
  );
};

// sort product by weight
export const sortByWeight = <T extends WithWeight>(array: T[]): T[] => {
  const withWeight = array.filter((item) => item.data.weight !== undefined);
  const withoutWeight = array.filter((item) => item.data.weight === undefined);

  const sortedWeightedArray = [...withWeight].sort(
    (a, b) => toNumber(a.data.weight) - toNumber(b.data.weight),
  );

  return [...sortedWeightedArray, ...withoutWeight];
};
