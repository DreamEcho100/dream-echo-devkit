// src/utils/index.ts
import { createStore } from "zustand";
import { useRef, useId, useMemo } from "react";
var handleCreateTableStore = ({
  classNames = {},
  pageViewMode = "PAGING",
  canMultiRowSelect = false,
  tableAutoToFixedOnLoad = false,
  columnVisibility = {},
  baseId = "",
  queryInput
}) => createStore((set) => ({
  table: null,
  baseId,
  queryInput,
  classNames,
  pageViewMode,
  canMultiRowSelect,
  tableAutoToFixedOnLoad,
  columnFilters: [],
  rowSelection: {},
  columnVisibility,
  sorting: [],
  setPagination: (updaterOrValue) => set((prevData) => {
    const pagination = typeof updaterOrValue === "function" ? updaterOrValue({
      pageIndex: prevData.queryInput.offset || 0,
      pageSize: prevData.queryInput.limit || 0
    }) : {
      pageIndex: updaterOrValue.pageIndex || prevData.queryInput.offset,
      pageSize: updaterOrValue.pageSize || prevData.queryInput.limit
    };
    return {
      queryInput: {
        ...prevData.queryInput,
        limit: pagination.pageSize,
        offset: pagination.pageIndex
      }
    };
  }),
  setQueryInput: (updaterOrValue) => set((prevData) => ({
    queryInput: typeof updaterOrValue === "function" ? updaterOrValue(prevData.queryInput) : updaterOrValue
  })),
  setRowSelection: (updaterOrValue) => set((prevData) => ({
    rowSelection: typeof updaterOrValue === "function" ? updaterOrValue(prevData.rowSelection) : updaterOrValue
  })),
  setColumnFilters: (updaterOrValue) => set((prevData) => ({
    columnFilters: typeof updaterOrValue === "function" ? updaterOrValue(prevData.columnFilters) : updaterOrValue
  })),
  setColumnVisibility: (updaterOrValue) => set((prevData) => ({
    columnVisibility: typeof updaterOrValue === "function" ? updaterOrValue(prevData.columnVisibility) : updaterOrValue
  })),
  setSorting: (updaterOrValue) => set((prevData) => ({
    sorting: typeof updaterOrValue === "function" ? updaterOrValue(prevData.sorting) : updaterOrValue
  }))
}));
var useCreateTableStore = (props) => {
  const baseId = useId();
  const storeRef = useRef(
    handleCreateTableStore({
      ...props,
      baseId: props.baseId || baseId
    })
  );
  useMemo(() => {
    if (storeRef.current.getState().queryInput.limit !== props.queryInput.limit || storeRef.current.getState().baseId !== props.baseId)
      storeRef.current.setState(() => ({
        limit: props.queryInput.limit,
        baseId: props.baseId
      }));
  }, [props.baseId, props.queryInput.limit]);
  return storeRef.current;
};

// src/components/TableLoadMore.tsx
import { useMemo as useMemo3 } from "react";
import { useStore as useStore2 } from "zustand";

// src/utils/internal.ts
import { useMemo as useMemo2 } from "react";
import { useStore } from "zustand";
var cx = (...classesArr) => {
  let classesStr = "";
  let className;
  for (className of classesArr) {
    if (typeof className === "string")
      classesStr += className + " ";
  }
  return classesStr.trimEnd();
};
var useGetTableCurrentPageAndPagination = (props) => {
  const pageViewMode = useStore(props.store, (state) => state.pageViewMode);
  const offset = useStore(props.store, (state) => state.queryInput.offset || 0);
  const defaultPage = useMemo2(() => [], []);
  const currentPage = useMemo2(() => {
    if (pageViewMode === "INFINITE_SCROLL")
      return (props.infiniteQuery?.data?.pages || defaultPage).map((page) => page.items).flat(1);
    return props.infiniteQuery?.data?.pages?.[offset]?.items || defaultPage;
  }, [offset, props.infiniteQuery.data?.pages, pageViewMode, defaultPage]);
  const pagination = useMemo2(
    () => ({
      offset,
      limit: props.infiniteQuery?.data?.pages.length || 0
    }),
    [offset, props.infiniteQuery?.data?.pages.length]
  );
  const res = useMemo2(
    () => ({
      currentPage,
      pagination: {
        pageSize: pagination.limit,
        pageIndex: pagination.offset
      }
    }),
    [currentPage, pagination.limit, pagination.offset]
  );
  return res;
};

// src/components/TableLoadMore.tsx
import { Fragment, jsx } from "react/jsx-runtime";
var TableLoadMore = ({
  infiniteQuery,
  store,
  classNames = {
    container: "",
    loadMoreButton: ""
  }
}) => {
  const offset = useStore2(store, (state) => state.queryInput.offset || 0);
  const storeUtils = useStore2(store, (state) => state);
  const { isLastPageEmpty, isInBeforeLastPage } = useMemo3(() => {
    const isLastPageEmpty2 = infiniteQuery?.data?.pages?.[infiniteQuery.data.pages.length - 1]?.items.length === 0;
    const isInFirstPage = offset === 0;
    const isInLastPage = offset + 1 === infiniteQuery?.data?.pages?.length;
    const isInBeforeLastPage2 = typeof infiniteQuery?.data?.pages?.length === "number" && infiniteQuery.data.pages.length !== 0 && offset + 1 === infiniteQuery.data.pages.length - 1;
    let pagesLength = infiniteQuery?.data?.pages?.length || 0;
    if (isLastPageEmpty2 && pagesLength !== 0)
      pagesLength--;
    return {
      isLastPageEmpty: isLastPageEmpty2,
      isInBeforeLastPage: isInBeforeLastPage2,
      isInLastPage,
      isInFirstPage,
      pagesLength
    };
  }, [offset, infiniteQuery?.data?.pages]);
  const isLoadMoreButtonDisabled = useMemo3(
    () => !infiniteQuery.hasNextPage && offset + 1 === infiniteQuery.data?.pages.length || infiniteQuery.isFetching || isInBeforeLastPage && isLastPageEmpty,
    [
      offset,
      infiniteQuery.data?.pages.length,
      infiniteQuery.hasNextPage,
      infiniteQuery.isFetching,
      isInBeforeLastPage,
      isLastPageEmpty
    ]
  );
  if (!infiniteQuery.hasNextPage)
    return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx("div", { className: cx(classNames?.container), children: /* @__PURE__ */ jsx(
    "button",
    {
      title: isLoadMoreButtonDisabled ? "There is no more next page" : "Next page",
      disabled: isLoadMoreButtonDisabled,
      onClick: async () => {
        if (isLoadMoreButtonDisabled)
          return;
        await infiniteQuery.fetchNextPage().then((res) => {
          if (res.data && Array.isArray(res.data?.pages)) {
            const lastPage = res.data.pages[res.data.pages.length - 1];
            if (!lastPage || isInBeforeLastPage && lastPage.items.length === 0)
              return;
          }
          storeUtils.setQueryInput((prev) => ({
            ...prev,
            offset: (prev.offset || 0) + 1
          }));
        });
      },
      className: cx(classNames?.loadMoreButton),
      children: "load more"
    }
  ) });
};
var TableLoadMore_default = TableLoadMore;

// src/components/Table/Query.tsx
import { useEffect as useEffect2, useMemo as useMemo4 } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";

// src/components/Table/Basic.tsx
import {
  useEffect,
  useRef as useRef2
} from "react";
import { useStore as useStore3 } from "zustand";
import { jsx as jsx2 } from "react/jsx-runtime";
var Table = ({
  store,
  ...props
}) => {
  const className = useStore3(store, (store2) => store2.classNames?.table);
  return /* @__PURE__ */ jsx2(
    "table",
    {
      ...props,
      className
    }
  );
};
var TableHeader = (props) => /* @__PURE__ */ jsx2(
  "thead",
  {
    ...props
  }
);
var TableBody = (props) => /* @__PURE__ */ jsx2(
  "tbody",
  {
    ...props
  }
);
var TableRow = (props) => /* @__PURE__ */ jsx2(
  "tr",
  {
    ...props
  }
);
var TableHead = (props) => /* @__PURE__ */ jsx2(
  "th",
  {
    ...props
  }
);
var TableCell = (props) => /* @__PURE__ */ jsx2("td", { ...props });
var IndeterminateCheckbox = ({
  indeterminate,
  store,
  tContainerType,
  ...props
}) => {
  const selectCheckBoxContainerClassName = useStore3(
    store,
    (store2) => tContainerType === "thead" ? store2.classNames?.thead?.th?.selectCheckBoxContainer : store2.classNames?.tbody?.td?.selectCheckBoxContainer
  );
  const ref = useRef2(null);
  useEffect(() => {
    if (!ref.current)
      return;
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !props.checked && indeterminate;
    }
  }, [indeterminate, props.checked]);
  return /* @__PURE__ */ jsx2("div", { className: selectCheckBoxContainerClassName?._, children: /* @__PURE__ */ jsx2(
    "input",
    {
      type: "checkbox",
      ref,
      className: selectCheckBoxContainerClassName?.checkbox,
      ...props
    }
  ) });
};

// src/components/Table/Query.tsx
import { useStore as useStore4 } from "zustand";
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
var CustomTableHeader = ({
  table,
  store
}) => {
  const classNames = useStore4(store, (store2) => store2.classNames.thead);
  return /* @__PURE__ */ jsx3(TableHeader, { className: classNames?._, children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx3(TableRow, { className: classNames?.tr, children: headerGroup.headers.map((header) => {
    return /* @__PURE__ */ jsx3(
      TableHead,
      {
        "data-id": header.id,
        className: classNames?.th?._,
        "data-select-th": header.id === "select" ? true : void 0,
        children: header.isPlaceholder ? null : flexRender(
          header.column.columnDef.header,
          header.getContext()
        )
      },
      header.id
    );
  }) }, headerGroup.id)) });
};
var CustomTableBody = ({
  table,
  columnsLength,
  store
}) => {
  const classNames = useStore4(store, (store2) => store2.classNames.tbody);
  return /* @__PURE__ */ jsx3(
    TableBody,
    {
      className: classNames?._,
      "data-state": table.getRowModel().rows?.length > 0 ? void 0 : "empty",
      children: table.getRowModel().rows?.length > 0 ? table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx3(
        TableRow,
        {
          "data-state": row.getIsSelected() && "selected",
          className: classNames?.tr,
          children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx3(
            TableCell,
            {
              className: classNames?.td?._,
              "data-select-td": cell.column.id === "select" ? true : void 0,
              children: flexRender(cell.column.columnDef.cell, cell.getContext())
            },
            cell.id
          ))
        },
        row.id
      )) : /* @__PURE__ */ jsx3(TableRow, { "data-state": "empty", children: /* @__PURE__ */ jsx3(
        TableCell,
        {
          colSpan: columnsLength,
          "data-state": "empty",
          className: "h-24 text-center",
          children: "No results."
        }
      ) })
    }
  );
};
var QueryTable = ({
  columns,
  store,
  infiniteQuery
}) => {
  const storeUtils = useStore4(store, (store2) => store2);
  const canMultiRowSelect = useStore4(store, (state) => state.canMultiRowSelect);
  const modifiedColumns = useMemo4(() => {
    return [
      {
        id: "select",
        header: ({ table: table2 }) => /* @__PURE__ */ jsx3(
          IndeterminateCheckbox,
          {
            checked: table2.getIsAllRowsSelected(),
            indeterminate: table2.getIsSomeRowsSelected(),
            onChange: table2.getToggleAllRowsSelectedHandler(),
            tContainerType: "thead",
            store
          }
        ),
        cell: ({ row }) => /* @__PURE__ */ jsx3(
          IndeterminateCheckbox,
          {
            checked: row.getIsSelected(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
            tContainerType: "tbody",
            store
          }
        ),
        enableSorting: false,
        enableHiding: canMultiRowSelect
      },
      ...columns
    ];
  }, [canMultiRowSelect, columns, store]);
  const sorting = useStore4(store, (store2) => store2.sorting);
  const columnFilters = useStore4(store, (store2) => store2.columnFilters);
  const columnVisibility = useStore4(store, (store2) => store2.columnVisibility);
  const rowSelection = useStore4(store, (store2) => store2.rowSelection);
  const currentPageAndPagination = useGetTableCurrentPageAndPagination({
    infiniteQuery,
    store
  });
  const table = useReactTable({
    data: currentPageAndPagination.currentPage,
    columns: modifiedColumns,
    onSortingChange: storeUtils.setSorting,
    onColumnFiltersChange: storeUtils.setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: storeUtils.setPagination,
    onColumnVisibilityChange: storeUtils.setColumnVisibility,
    onRowSelectionChange: storeUtils.setRowSelection,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    state: {
      pagination: currentPageAndPagination.pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });
  useEffect2(() => store.setState({ table }), [store, table]);
  return /* @__PURE__ */ jsxs(Table, { store, children: [
    /* @__PURE__ */ jsx3(CustomTableHeader, { table, store }),
    /* @__PURE__ */ jsx3(
      CustomTableBody,
      {
        table,
        columnsLength: columns.length,
        store
      }
    )
  ] });
};
var Query_default = QueryTable;
export {
  Query_default as QueryTable,
  TableLoadMore_default as TableLoadMore,
  handleCreateTableStore,
  useCreateTableStore
};
//# sourceMappingURL=index.mjs.map