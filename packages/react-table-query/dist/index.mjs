// src/utils/index.ts
import { createStore } from "zustand";
import {
  useRef,
  useId
} from "react";
var handleCreateTableStore = ({
  classNames = {},
  pageViewMode = "PAGING",
  canMultiRowSelect = false,
  tableAutoToFixedOnLoad = false,
  columnVisibility = {},
  baseId = "",
  pageSize
}) => createStore((set) => ({
  table: null,
  baseId,
  pageIndex: 0,
  pageSize,
  classNames,
  pageViewMode,
  canMultiRowSelect,
  tableAutoToFixedOnLoad,
  columnFilters: [],
  rowSelection: {},
  columnVisibility,
  sorting: [],
  utils: {
    setPagination: (updaterOrValue) => set((prevData) => ({
      ...typeof updaterOrValue === "function" ? updaterOrValue({
        pageIndex: prevData.pageIndex,
        pageSize: prevData.pageSize
      }) : updaterOrValue
    })),
    setPageIndex: (updaterOrValue) => set((prevData) => ({
      pageIndex: typeof updaterOrValue === "function" ? updaterOrValue(prevData.pageIndex) : updaterOrValue
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
  }
}));
var useCreateTableStore = (props) => {
  const baseId = useId();
  const storeRef = useRef(
    handleCreateTableStore({ ...props, baseId: props.baseId || baseId })
  );
  return storeRef.current;
};

// src/components/TableLoadMore.tsx
import { useMemo } from "react";
import { useStore } from "zustand";

// src/utils/internal.ts
var cx = (...classesArr) => {
  let classesStr = "";
  let className;
  for (className of classesArr) {
    if (typeof className === "string")
      classesStr += className + " ";
  }
  return classesStr.trimEnd();
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
  const pageIndex = useStore(store, (state) => state.pageIndex);
  const storeUtils = useStore(store, (state) => state.utils);
  const { isLastPageEmpty, isInBeforeLastPage } = useMemo(() => {
    const isLastPageEmpty2 = infiniteQuery?.data?.pages?.[infiniteQuery.data.pages.length - 1]?.items.length === 0;
    const isInFirstPage = pageIndex === 0;
    const isInLastPage = pageIndex + 1 === infiniteQuery?.data?.pages?.length;
    const isInBeforeLastPage2 = typeof infiniteQuery?.data?.pages?.length === "number" && infiniteQuery.data.pages.length !== 0 && pageIndex + 1 === infiniteQuery.data.pages.length - 1;
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
  }, [pageIndex, infiniteQuery?.data?.pages]);
  const isLoadMoreButtonDisabled = useMemo(
    () => !infiniteQuery.hasNextPage && pageIndex + 1 === infiniteQuery.data?.pages.length || infiniteQuery.isFetching || isInBeforeLastPage && isLastPageEmpty,
    [
      pageIndex,
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
          storeUtils.setPageIndex((pageIndex2) => pageIndex2 + 1);
        });
      },
      className: cx(classNames?.loadMoreButton),
      children: "load more"
    }
  ) });
};
var TableLoadMore_default = TableLoadMore;

// src/components/Table/Data.tsx
import { useEffect, useMemo as useMemo2, useRef as useRef2 } from "react";
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
  forwardRef
} from "react";
import { jsx as jsx2 } from "react/jsx-runtime";
var Table = forwardRef(
  (props, ref) => /* @__PURE__ */ jsx2(
    "table",
    {
      ref,
      ...props
    }
  )
);
Table.displayName = "Table";
var TableHeader = forwardRef((props, ref) => /* @__PURE__ */ jsx2(
  "thead",
  {
    ref,
    ...props
  }
));
TableHeader.displayName = "TableHeader";
var TableBody = forwardRef((props, ref) => /* @__PURE__ */ jsx2(
  "tbody",
  {
    ref,
    ...props
  }
));
TableBody.displayName = "TableBody";
var TableFooter = forwardRef((props, ref) => /* @__PURE__ */ jsx2(
  "tfoot",
  {
    ref,
    ...props
  }
));
TableFooter.displayName = "TableFooter";
var TableRow = forwardRef((props, ref) => /* @__PURE__ */ jsx2(
  "tr",
  {
    ref,
    ...props
  }
));
TableRow.displayName = "TableRow";
var TableHead = forwardRef((props, ref) => /* @__PURE__ */ jsx2(
  "th",
  {
    ref,
    ...props
  }
));
TableHead.displayName = "TableHead";
var TableCell = forwardRef((props, ref) => /* @__PURE__ */ jsx2("td", { ref, ...props }));
TableCell.displayName = "TableCell";
var TableCaption = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx2(
  "caption",
  {
    ref,
    className: cx("text-muted-foreground mt-4 text-sm", className),
    ...props
  }
));
TableCaption.displayName = "TableCaption";

// src/components/Table/Data.tsx
import { useStore as useStore2 } from "zustand";
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
var CustomTableHeader = ({
  table,
  store
}) => {
  const classNames = useStore2(store, (store2) => store2.classNames.thead);
  return /* @__PURE__ */ jsx3(TableHeader, { className: classNames?._, children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx3(TableRow, { className: classNames?.tr, children: headerGroup.headers.map((header) => {
    return /* @__PURE__ */ jsx3(
      TableHead,
      {
        className: cx(
          header.id === "select" ? 'data-[select-th="true"]' : void 0,
          classNames?.th?._
        ),
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
  const classNames = useStore2(store, (store2) => store2.classNames.tbody);
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
              className: cx(
                cell.id === "select" ? 'data-[select-th="true"]' : void 0,
                classNames?.td?._
              ),
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
var IndeterminateCheckbox = ({
  indeterminate,
  className = "",
  ...props
}) => {
  const ref = useRef2(null);
  useEffect(() => {
    if (!ref.current)
      return;
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !props.checked && indeterminate;
    }
  }, [indeterminate, props.checked]);
  return /* @__PURE__ */ jsx3("input", { type: "checkbox", ref, className, ...props });
};
var QueryTable = ({
  columns,
  store,
  infiniteQuery
}) => {
  const sorting = useStore2(store, (store2) => store2.sorting);
  const columnFilters = useStore2(store, (store2) => store2.columnFilters);
  const columnVisibility = useStore2(store, (store2) => store2.columnVisibility);
  const rowSelection = useStore2(store, (store2) => store2.rowSelection);
  const storeUtils = useStore2(store, (store2) => store2.utils);
  const pageViewMode = useStore2(store, (state) => state.pageViewMode);
  const pageIndex = useStore2(store, (state) => state.pageIndex);
  const canMultiRowSelect = useStore2(store, (state) => state.canMultiRowSelect);
  const modifiedColumns = useMemo2(() => {
    return [
      {
        id: "select",
        header: ({ table: table2 }) => /* @__PURE__ */ jsx3(
          IndeterminateCheckbox,
          {
            checked: table2.getIsAllRowsSelected(),
            indeterminate: table2.getIsSomeRowsSelected(),
            onChange: table2.getToggleAllRowsSelectedHandler()
          }
        ),
        cell: ({ row }) => /* @__PURE__ */ jsx3(
          IndeterminateCheckbox,
          {
            checked: row.getIsSelected(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler()
          }
        ),
        enableSorting: false,
        enableHiding: canMultiRowSelect
      },
      ...columns
    ];
  }, [columns, canMultiRowSelect]);
  const defaultPage = useMemo2(() => [], []);
  const currentPage = useMemo2(() => {
    if (pageViewMode === "INFINITE_SCROLL")
      return (infiniteQuery?.data?.pages || defaultPage).map((page) => page.items).flat(1);
    return infiniteQuery?.data?.pages?.[pageIndex]?.items || defaultPage;
  }, [pageIndex, infiniteQuery.data?.pages, pageViewMode, defaultPage]);
  const pagination = useMemo2(
    () => ({
      pageIndex,
      pageSize: infiniteQuery?.data?.pages.length || 0
    }),
    [pageIndex, infiniteQuery?.data?.pages.length]
  );
  const table = useReactTable({
    data: currentPage,
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
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });
  useMemo2(() => store.setState({ table }), [store, table]);
  return /* @__PURE__ */ jsxs(Table, { children: [
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
var Data_default = QueryTable;
export {
  Data_default as QueryTable,
  TableLoadMore_default as TableLoadMore,
  handleCreateTableStore,
  useCreateTableStore
};
//# sourceMappingURL=index.mjs.map