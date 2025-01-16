import {LiteratureReference} from "../model/event.model";

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}

export function sortByYearDescending(refs: LiteratureReference[]) {
  return refs.sort((a, b) => {
    if (a.year === undefined && b.year === undefined) return 0;
    if (a.year === undefined) return 1;
    if (b.year === undefined) return -1;
    return b.year - a.year;
  });
}

