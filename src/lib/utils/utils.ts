export type SearchParams = Record<string, string | string[] | undefined>;

export function getPageNum(params: SearchParams) {
  return params.page
    ? Array.isArray(params.page)
      ? params.page[0]
      : params.page
    : "";
}

export interface BookActions {
  actions: { next: string; previous: string };
}
