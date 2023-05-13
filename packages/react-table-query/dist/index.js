"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  QueryTable: () => Data_default,
  TableLoadMore: () => TableLoadMore_default,
  handleCreateTableStore: () => handleCreateTableStore,
  useCreateTableStore: () => useCreateTableStore
});
module.exports = __toCommonJS(src_exports);

// src/utils/index.ts
var import_zustand = require("zustand");
var import_react = require("react");
var handleCreateTableStore = ({
  classNames = {},
  pageViewMode = "PAGING",
  canMultiRowSelect = false,
  tableAutoToFixedOnLoad = false,
  columnVisibility = {},
  baseId = "",
  pageSize
}) => (0, import_zustand.createStore)((set) => ({
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
  const baseId = (0, import_react.useId)();
  const storeRef = (0, import_react.useRef)(
    handleCreateTableStore({ ...props, baseId: props.baseId || baseId })
  );
  (0, import_react.useMemo)(() => {
    if (storeRef.current.getState().pageSize !== props.pageSize || storeRef.current.getState().baseId !== props.baseId)
      storeRef.current.setState(() => ({
        pageSize: props.pageSize,
        baseId: props.baseId
      }));
  }, [props.baseId, props.pageSize]);
  return storeRef.current;
};

// src/components/TableLoadMore.tsx
var import_react2 = require("react");
var import_zustand2 = require("zustand");

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
var import_jsx_runtime = require("react/jsx-runtime");
var TableLoadMore = ({
  infiniteQuery,
  store,
  classNames = {
    container: "",
    loadMoreButton: ""
  }
}) => {
  const pageIndex = (0, import_zustand2.useStore)(store, (state) => state.pageIndex);
  const storeUtils = (0, import_zustand2.useStore)(store, (state) => state.utils);
  const { isLastPageEmpty, isInBeforeLastPage } = (0, import_react2.useMemo)(() => {
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
  const isLoadMoreButtonDisabled = (0, import_react2.useMemo)(
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
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {});
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cx(classNames?.container), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
var import_react4 = require("react");
var import_react_table = require("@tanstack/react-table");

// src/components/Table/Basic.tsx
var import_react3 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
var Table = (0, import_react3.forwardRef)(
  (props, ref) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "table",
    {
      ref,
      ...props
    }
  )
);
Table.displayName = "Table";
var TableHeader = (0, import_react3.forwardRef)((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
  "thead",
  {
    ref,
    ...props
  }
));
TableHeader.displayName = "TableHeader";
var TableBody = (0, import_react3.forwardRef)((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
  "tbody",
  {
    ref,
    ...props
  }
));
TableBody.displayName = "TableBody";
var TableFooter = (0, import_react3.forwardRef)((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
  "tfoot",
  {
    ref,
    ...props
  }
));
TableFooter.displayName = "TableFooter";
var TableRow = (0, import_react3.forwardRef)((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
  "tr",
  {
    ref,
    ...props
  }
));
TableRow.displayName = "TableRow";
var TableHead = (0, import_react3.forwardRef)((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
  "th",
  {
    ref,
    ...props
  }
));
TableHead.displayName = "TableHead";
var TableCell = (0, import_react3.forwardRef)((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("td", { ref, ...props }));
TableCell.displayName = "TableCell";
var TableCaption = (0, import_react3.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
  "caption",
  {
    ref,
    className: cx("text-muted-foreground mt-4 text-sm", className),
    ...props
  }
));
TableCaption.displayName = "TableCaption";

// src/components/Table/Data.tsx
var import_zustand3 = require("zustand");
var import_jsx_runtime3 = require("react/jsx-runtime");
var CustomTableHeader = ({
  table,
  store
}) => {
  const classNames = (0, import_zustand3.useStore)(store, (store2) => store2.classNames.thead);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(TableHeader, { className: classNames?._, children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(TableRow, { className: classNames?.tr, children: headerGroup.headers.map((header) => {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      TableHead,
      {
        className: cx(
          header.id === "select" ? 'data-[select-th="true"]' : void 0,
          classNames?.th?._
        ),
        children: header.isPlaceholder ? null : (0, import_react_table.flexRender)(
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
  const classNames = (0, import_zustand3.useStore)(store, (store2) => store2.classNames.tbody);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    TableBody,
    {
      className: classNames?._,
      "data-state": table.getRowModel().rows?.length > 0 ? void 0 : "empty",
      children: table.getRowModel().rows?.length > 0 ? table.getRowModel().rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        TableRow,
        {
          "data-state": row.getIsSelected() && "selected",
          className: classNames?.tr,
          children: row.getVisibleCells().map((cell) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            TableCell,
            {
              className: cx(
                cell.id === "select" ? 'data-[select-th="true"]' : void 0,
                classNames?.td?._
              ),
              children: (0, import_react_table.flexRender)(cell.column.columnDef.cell, cell.getContext())
            },
            cell.id
          ))
        },
        row.id
      )) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(TableRow, { "data-state": "empty", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
  const ref = (0, import_react4.useRef)(null);
  (0, import_react4.useEffect)(() => {
    if (!ref.current)
      return;
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !props.checked && indeterminate;
    }
  }, [indeterminate, props.checked]);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { type: "checkbox", ref, className, ...props });
};
var QueryTable = ({
  columns,
  store,
  infiniteQuery
}) => {
  const sorting = (0, import_zustand3.useStore)(store, (store2) => store2.sorting);
  const columnFilters = (0, import_zustand3.useStore)(store, (store2) => store2.columnFilters);
  const columnVisibility = (0, import_zustand3.useStore)(store, (store2) => store2.columnVisibility);
  const rowSelection = (0, import_zustand3.useStore)(store, (store2) => store2.rowSelection);
  const storeUtils = (0, import_zustand3.useStore)(store, (store2) => store2.utils);
  const pageViewMode = (0, import_zustand3.useStore)(store, (state) => state.pageViewMode);
  const pageIndex = (0, import_zustand3.useStore)(store, (state) => state.pageIndex);
  const canMultiRowSelect = (0, import_zustand3.useStore)(store, (state) => state.canMultiRowSelect);
  const modifiedColumns = (0, import_react4.useMemo)(() => {
    return [
      {
        id: "select",
        header: ({ table: table2 }) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          IndeterminateCheckbox,
          {
            checked: table2.getIsAllRowsSelected(),
            indeterminate: table2.getIsSomeRowsSelected(),
            onChange: table2.getToggleAllRowsSelectedHandler()
          }
        ),
        cell: ({ row }) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
  const defaultPage = (0, import_react4.useMemo)(() => [], []);
  const currentPage = (0, import_react4.useMemo)(() => {
    if (pageViewMode === "INFINITE_SCROLL")
      return (infiniteQuery?.data?.pages || defaultPage).map((page) => page.items).flat(1);
    return infiniteQuery?.data?.pages?.[pageIndex]?.items || defaultPage;
  }, [pageIndex, infiniteQuery.data?.pages, pageViewMode, defaultPage]);
  const pagination = (0, import_react4.useMemo)(
    () => ({
      pageIndex,
      pageSize: infiniteQuery?.data?.pages.length || 0
    }),
    [pageIndex, infiniteQuery?.data?.pages.length]
  );
  const table = (0, import_react_table.useReactTable)({
    data: currentPage,
    columns: modifiedColumns,
    onSortingChange: storeUtils.setSorting,
    onColumnFiltersChange: storeUtils.setColumnFilters,
    getCoreRowModel: (0, import_react_table.getCoreRowModel)(),
    getPaginationRowModel: (0, import_react_table.getPaginationRowModel)(),
    getSortedRowModel: (0, import_react_table.getSortedRowModel)(),
    getFilteredRowModel: (0, import_react_table.getFilteredRowModel)(),
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
  (0, import_react4.useMemo)(() => store.setState({ table }), [store, table]);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Table, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CustomTableHeader, { table, store }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  QueryTable,
  TableLoadMore,
  handleCreateTableStore,
  useCreateTableStore
});
//# sourceMappingURL=index.js.map