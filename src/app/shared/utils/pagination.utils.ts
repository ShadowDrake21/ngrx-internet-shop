export const calcPageNum = (
  totalCount: number,
  itemsPerPage: number
): number => {
  return Math.floor(totalCount / itemsPerPage);
};
