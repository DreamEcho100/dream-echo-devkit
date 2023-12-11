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
  QueryTable: () => Query_default,
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
  queryInput
}) => (0, import_zustand.createStore)((set) => ({
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
  const baseId = (0, import_react.useId)();
  const storeRef = (0, import_react.useRef)(
    handleCreateTableStore({
      ...props,
      baseId: props.baseId || baseId
    })
  );
  (0, import_react.useMemo)(() => {
    if (storeRef.current.getState().queryInput.limit !== props.queryInput.limit || storeRef.current.getState().baseId !== props.baseId)
      storeRef.current.setState(() => ({
        limit: props.queryInput.limit,
        baseId: props.baseId
      }));
  }, [props.baseId, props.queryInput.limit]);
  return storeRef.current;
};

// src/components/TableLoadMore.tsx
var import_react3 = require("react");
var import_zustand3 = require("zustand");

// src/utils/internal.ts
var import_react2 = require("react");
var import_zustand2 = require("zustand");
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
  const pageViewMode = (0, import_zustand2.useStore)(props.store, (state) => state.pageViewMode);
  const offset = (0, import_zustand2.useStore)(props.store, (state) => state.queryInput.offset || 0);
  const defaultPage = (0, import_react2.useMemo)(() => [], []);
  const currentPage = (0, import_react2.useMemo)(() => {
    if (pageViewMode === "INFINITE_SCROLL")
      return (props.infiniteQuery?.data?.pages || defaultPage).map((page) => page.items).flat(1);
    return props.infiniteQuery?.data?.pages?.[offset]?.items || defaultPage;
  }, [offset, props.infiniteQuery.data?.pages, pageViewMode, defaultPage]);
  const pagination = (0, import_react2.useMemo)(
    () => ({
      offset,
      limit: props.infiniteQuery?.data?.pages.length || 0
    }),
    [offset, props.infiniteQuery?.data?.pages.length]
  );
  const res = (0, import_react2.useMemo)(
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
var import_jsx_runtime = require("react/jsx-runtime");
var TableLoadMore = ({
  infiniteQuery,
  store,
  classNames = {
    container: "",
    loadMoreButton: ""
  }
}) => {
  const offset = (0, import_zustand3.useStore)(store, (state) => state.queryInput.offset || 0);
  const storeUtils = (0, import_zustand3.useStore)(store, (state) => state);
  const { isLastPageEmpty, isInBeforeLastPage } = (0, import_react3.useMemo)(() => {
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
  const isLoadMoreButtonDisabled = (0, import_react3.useMemo)(
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
var import_react5 = require("react");
var import_react_table = require("@tanstack/react-table");

// src/components/Table/Basic.tsx
var import_react4 = require("react");
var import_zustand4 = require("zustand");
var import_jsx_runtime2 = require("react/jsx-runtime");
var Table = ({
  store,
  ...props
}) => {
  const className = (0, import_zustand4.useStore)(store, (store2) => store2.classNames?.table);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "table",
    {
      ...props,
      className
    }
  );
};
var TableHeader = (props) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
  "thead",
  {
    ...props
  }
);
var TableBody = (props) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
  "tbody",
  {
    ...props
  }
);
var TableRow = (props) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
  "tr",
  {
    ...props
  }
);
var TableHead = (props) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
  "th",
  {
    ...props
  }
);
var TableCell = (props) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("td", { ...props });
var IndeterminateCheckbox = ({
  indeterminate,
  store,
  tContainerType,
  ...props
}) => {
  const selectCheckBoxContainerClassName = (0, import_zustand4.useStore)(
    store,
    (store2) => tContainerType === "thead" ? store2.classNames?.thead?.th?.selectCheckBoxContainer : store2.classNames?.tbody?.td?.selectCheckBoxContainer
  );
  const ref = (0, import_react4.useRef)(null);
  (0, import_react4.useEffect)(() => {
    if (!ref.current)
      return;
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !props.checked && indeterminate;
    }
  }, [indeterminate, props.checked]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: selectCheckBoxContainerClassName?._, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
var import_zustand5 = require("zustand");
var import_jsx_runtime3 = require("react/jsx-runtime");
var CustomTableHeader = ({
  table,
  store
}) => {
  const classNames = (0, import_zustand5.useStore)(store, (store2) => store2.classNames.thead);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(TableHeader, { className: classNames?._, children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(TableRow, { className: classNames?.tr, children: headerGroup.headers.map((header) => {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      TableHead,
      {
        "data-id": header.id,
        className: classNames?.th?._,
        "data-select-th": header.id === "select" ? true : void 0,
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
  const classNames = (0, import_zustand5.useStore)(store, (store2) => store2.classNames.tbody);
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
              className: classNames?.td?._,
              "data-select-td": cell.column.id === "select" ? true : void 0,
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
var QueryTable = ({
  columns,
  store,
  infiniteQuery
}) => {
  const storeUtils = (0, import_zustand5.useStore)(store, (store2) => store2);
  const canMultiRowSelect = (0, import_zustand5.useStore)(store, (state) => state.canMultiRowSelect);
  const modifiedColumns = (0, import_react5.useMemo)(() => {
    return [
      {
        id: "select",
        header: ({ table: table2 }) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          IndeterminateCheckbox,
          {
            checked: table2.getIsAllRowsSelected(),
            indeterminate: table2.getIsSomeRowsSelected(),
            onChange: table2.getToggleAllRowsSelectedSchema(),
            tContainerType: "thead",
            store
          }
        ),
        cell: ({ row }) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          IndeterminateCheckbox,
          {
            checked: row.getIsSelected(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedSchema(),
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
  const sorting = (0, import_zustand5.useStore)(store, (store2) => store2.sorting);
  const columnFilters = (0, import_zustand5.useStore)(store, (store2) => store2.columnFilters);
  const columnVisibility = (0, import_zustand5.useStore)(store, (store2) => store2.columnVisibility);
  const rowSelection = (0, import_zustand5.useStore)(store, (store2) => store2.rowSelection);
  const currentPageAndPagination = useGetTableCurrentPageAndPagination({
    infiniteQuery,
    store
  });
  const table = (0, import_react_table.useReactTable)({
    data: currentPageAndPagination.currentPage,
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
      pagination: currentPageAndPagination.pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });
  (0, import_react5.useEffect)(() => store.setState({ table }), [store, table]);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Table, { store, children: [
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
var Query_default = QueryTable;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  QueryTable,
  TableLoadMore,
  handleCreateTableStore,
  useCreateTableStore
});
//# sourceMappingURL=index.js.map