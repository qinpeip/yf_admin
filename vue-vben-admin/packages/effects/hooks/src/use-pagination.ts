import type { Ref } from 'vue';

import { computed, ref, unref, watch } from 'vue';

/**
 * Paginates an array of items
 * @param list The array to paginate
 * @param pageNo The current page number (1-based)
 * @param pageSize Number of items per page
 * @returns Paginated array slice
 * @throws {Error} When pageNo or pageSize is invalid
 */
function pagination<T = any>(list: T[], pageNo: number, pageSize: number): T[] {
  if (pageNo < 1) throw new Error('Page number must be positive');
  if (pageSize < 1) throw new Error('Page size must be positive');

  const offset = (pageNo - 1) * Number(pageSize);
  const ret =
    offset + pageSize >= list.length
      ? list.slice(offset)
      : list.slice(offset, offset + pageSize);
  return ret;
}

export function usePagination<T = any>(
  list: Ref<T[]>,
  pageSize: number,
  totalChangeToFirstPage = true,
) {
  const currentPage = ref(1);
  const pageSizeRef = ref(pageSize);

  const totalPages = computed(() => {
    const n = unref(list).length;
    const ps = unref(pageSizeRef);
    if (n === 0) return 0;
    return Math.ceil(n / ps);
  });

  const paginationList = computed(() => {
    const listVal = unref(list);
    const ps = unref(pageSizeRef);
    const page = unref(currentPage);
    if (listVal.length === 0) {
      return [];
    }
    return pagination(listVal, page, ps);
  });

  const total = computed(() => {
    return unref(list).length;
  });

  if (totalChangeToFirstPage) {
    watch(total, () => {
      setCurrentPage(1);
    });
  }

  /** 列表变短时当前页可能越界（如 IconPicker 搜索后），同步钳制到末页 */
  watch(
    [totalPages, currentPage],
    () => {
      const tp = unref(totalPages);
      if (tp === 0) {
        currentPage.value = 1;
        return;
      }
      if (unref(currentPage) > tp) {
        currentPage.value = tp;
      }
    },
    { flush: 'sync' },
  );

  function setCurrentPage(page: number) {
    const n = unref(list).length;
    const ps = unref(pageSizeRef);
    if (n === 0) {
      currentPage.value = 1;
      return;
    }
    const maxPage = Math.ceil(n / ps) || 1;
    currentPage.value = Math.min(Math.max(1, page), maxPage);
  }

  function setPageSize(pageSize: number) {
    if (pageSize < 1) {
      throw new Error('Page size must be positive');
    }
    pageSizeRef.value = pageSize;
    currentPage.value = 1;
  }

  return { setCurrentPage, total, setPageSize, paginationList, currentPage };
}
