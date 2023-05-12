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
  CustomTable: () => CustomTable,
  TableLoadMore: () => TableLoadMore_default,
  TableMetaData: () => TableMetaData_default,
  handleCreateTableStore: () => handleCreateTableStore,
  useCreateTableStore: () => useCreateTableStore
});
module.exports = __toCommonJS(src_exports);

// src/utils/index.ts
var import_zustand = require("zustand");
var import_react = require("react");
var handleCreateTableStore = ({
  filterByFormValues = {},
  classNames = {},
  pageViewMode = "PAGING",
  tableAutoToFixedOnLoad = false
}) => (0, import_zustand.createStore)((set) => ({
  classNames,
  table: null,
  columnFilters: [],
  rowSelection: {},
  filterByFormValues,
  debouncedValue: {},
  currentPageIndex: 0,
  remoteFilter: true,
  pageViewMode,
  tableAutoToFixedOnLoad,
  utils: {
    incrementCurrentPageIndex: () => set((state) => ({
      currentPageIndex: state.currentPageIndex + 1
    })),
    decrementCurrentPageIndex: () => set((state) => ({
      currentPageIndex: state.currentPageIndex - 1
    })),
    setRowSelection: (updaterOrValue) => set((prevData) => ({
      rowSelection: typeof updaterOrValue === "function" ? updaterOrValue(prevData.rowSelection) : updaterOrValue
    })),
    setColumnFilters: (updaterOrValue) => set((prevData) => ({
      columnFilters: typeof updaterOrValue === "function" ? updaterOrValue(prevData.columnFilters) : updaterOrValue
    })),
    setFilterByFormValues: (updaterOrValue) => set((prevData) => ({
      filterByFormValues: !prevData.filterByFormValues ? prevData.filterByFormValues : typeof updaterOrValue === "function" ? updaterOrValue(prevData.filterByFormValues) : updaterOrValue
    }))
  }
}));
var useCreateTableStore = (props) => {
  const formStoreRef = (0, import_react.useRef)(handleCreateTableStore(props));
  const configRef = (0, import_react.useRef)({ counter: 0 });
  (0, import_react.useEffect)(() => {
    configRef.current.counter++;
    if (configRef.current.counter === 1)
      return;
    formStoreRef.current = handleCreateTableStore(props);
  }, [props]);
  return formStoreRef.current;
};

// src/components/TableMetaData.tsx
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

// src/components/icons/IoIosArrowBack.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var IoIosArrowBack = (props) => {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "svg",
    {
      stroke: "currentColor",
      fill: "currentColor",
      "stroke-width": "0",
      viewBox: "0 0 512 512",
      height: "1em",
      width: "1em",
      xmlns: "http://www.w3.org/2000/svg",
      ...props,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M217.9 256L345 129c9.4-9.4 9.4-24.6 0-33.9-9.4-9.4-24.6-9.3-34 0L167 239c-9.1 9.1-9.3 23.7-.7 33.1L310.9 417c4.7 4.7 10.9 7 17 7s12.3-2.3 17-7c9.4-9.4 9.4-24.6 0-33.9L217.9 256z" })
    }
  );
};
var IoIosArrowBack_default = IoIosArrowBack;

// src/components/icons/IoMdRefresh.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var IoMdRefresh = (props) => {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "svg",
    {
      stroke: "currentColor",
      fill: "currentColor",
      "stroke-width": "0",
      viewBox: "0 0 512 512",
      height: "1em",
      width: "1em",
      xmlns: "http://www.w3.org/2000/svg",
      ...props,
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M256 388c-72.597 0-132-59.405-132-132 0-72.601 59.403-132 132-132 36.3 0 69.299 15.4 92.406 39.601L278 234h154V80l-51.698 51.702C348.406 99.798 304.406 80 256 80c-96.797 0-176 79.203-176 176s78.094 176 176 176c81.045 0 148.287-54.134 169.401-128H378.85c-18.745 49.561-67.138 84-122.85 84z" })
    }
  );
};
var IoMdRefresh_default = IoMdRefresh;

// src/components/icons/IoIosArrowForward.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var IoIosArrowForward = (props) => {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "svg",
    {
      stroke: "currentColor",
      fill: "currentColor",
      "stroke-width": "0",
      viewBox: "0 0 512 512",
      height: "1em",
      width: "1em",
      xmlns: "http://www.w3.org/2000/svg",
      ...props,
      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z" })
    }
  );
};
var IoIosArrowForward_default = IoIosArrowForward;

// src/components/TableMetaData.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var TableMetaData = ({
  infiniteQuery,
  store,
  classNames = {
    container: "",
    refetchButton: "",
    previousPageButton: "",
    nextPageButton: ""
  }
}) => {
  const currentPageIndex = (0, import_zustand2.useStore)(store, (state) => state.currentPageIndex);
  const {
    incrementCurrentPageIndex,
    decrementCurrentPageIndex,
    setRowSelection
  } = (0, import_zustand2.useStore)(store, (state) => state.utils);
  const {
    isLastPageEmpty,
    // isInLastPage,
    isInBeforeLastPage,
    // isInFirstPage,
    pagesLength
  } = (0, import_react2.useMemo)(() => {
    const isLastPageEmpty2 = infiniteQuery?.data?.pages?.[infiniteQuery.data.pages.length - 1]?.items.length === 0;
    const isInBeforeLastPage2 = typeof infiniteQuery?.data?.pages?.length === "number" && infiniteQuery.data.pages.length !== 0 && currentPageIndex + 1 === infiniteQuery.data.pages.length - 1;
    let pagesLength2 = infiniteQuery?.data?.pages?.length || 0;
    if (isLastPageEmpty2 && pagesLength2 !== 0)
      pagesLength2--;
    return {
      isLastPageEmpty: isLastPageEmpty2,
      isInBeforeLastPage: isInBeforeLastPage2,
      // isInLastPage,
      // isInFirstPage,
      pagesLength: pagesLength2
    };
  }, [currentPageIndex, infiniteQuery?.data?.pages]);
  const isNextPageDisabled = (0, import_react2.useMemo)(
    () => !infiniteQuery.hasNextPage && currentPageIndex + 1 === infiniteQuery.data?.pages.length || infiniteQuery.isFetching || isInBeforeLastPage && isLastPageEmpty,
    [
      currentPageIndex,
      infiniteQuery.data?.pages.length,
      infiniteQuery.hasNextPage,
      infiniteQuery.isFetching,
      isInBeforeLastPage,
      isLastPageEmpty
    ]
  );
  const isPreviousPageDisabled = (0, import_react2.useMemo)(
    () => currentPageIndex === 0 || infiniteQuery.isFetching,
    [currentPageIndex, infiniteQuery.isFetching]
  );
  const onPageChange = (0, import_react2.useCallback)(() => {
    setRowSelection({});
  }, [setRowSelection]);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: cx(classNames?.container), children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "button",
      {
        title: "refetch",
        disabled: infiniteQuery.isFetching,
        onClick: async () => {
          if (infiniteQuery.isFetching)
            return;
          await infiniteQuery.refetch();
        },
        className: cx(classNames?.refetchButton),
        children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(IoMdRefresh_default, { style: { background: "transparent", fontSize: "120%" } })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { title: "page/Loaded Pages", children: [
      currentPageIndex + 1,
      "/",
      pagesLength
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "button",
      {
        title: isNextPageDisabled ? "There is no more previous page" : "Previous page",
        disabled: isPreviousPageDisabled,
        onClick: () => {
          if (isPreviousPageDisabled)
            return;
          decrementCurrentPageIndex();
          onPageChange();
        },
        className: cx(classNames?.previousPageButton),
        children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          IoIosArrowBack_default,
          {
            style: { background: "transparent", fontSize: "120%" }
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "button",
      {
        title: isNextPageDisabled ? "There is no more next page" : "Next page",
        disabled: isNextPageDisabled,
        onClick: async () => {
          if (isNextPageDisabled)
            return;
          await infiniteQuery.fetchNextPage().then((res) => {
            if (res.data && Array.isArray(res.data?.pages)) {
              const lastPage = res.data.pages[res.data.pages.length - 1];
              if (!lastPage || isInBeforeLastPage && lastPage.items.length === 0)
                return;
            }
            incrementCurrentPageIndex();
            onPageChange();
          });
        },
        className: cx(classNames?.nextPageButton),
        children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          IoIosArrowForward_default,
          {
            style: { background: "transparent", fontSize: "120%" }
          }
        )
      }
    )
  ] });
};
var TableMetaData_default = TableMetaData;

// src/components/TableLoadMore.tsx
var import_react3 = require("react");
var import_zustand3 = require("zustand");
var import_jsx_runtime5 = require("react/jsx-runtime");
var TableLoadMore = ({
  infiniteQuery,
  store,
  classNames = {
    container: "",
    loadMoreButton: ""
  }
}) => {
  const currentPageIndex = (0, import_zustand3.useStore)(store, (state) => state.currentPageIndex);
  const { incrementCurrentPageIndex } = (0, import_zustand3.useStore)(store, (state) => state.utils);
  const { isLastPageEmpty, isInBeforeLastPage } = (0, import_react3.useMemo)(() => {
    const isLastPageEmpty2 = infiniteQuery?.data?.pages?.[infiniteQuery.data.pages.length - 1]?.items.length === 0;
    const isInFirstPage = currentPageIndex === 0;
    const isInLastPage = currentPageIndex + 1 === infiniteQuery?.data?.pages?.length;
    const isInBeforeLastPage2 = typeof infiniteQuery?.data?.pages?.length === "number" && infiniteQuery.data.pages.length !== 0 && currentPageIndex + 1 === infiniteQuery.data.pages.length - 1;
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
  }, [currentPageIndex, infiniteQuery?.data?.pages]);
  const isLoadMoreButtonDisabled = (0, import_react3.useMemo)(
    () => !infiniteQuery.hasNextPage && currentPageIndex + 1 === infiniteQuery.data?.pages.length || infiniteQuery.isFetching || isInBeforeLastPage && isLastPageEmpty,
    [
      currentPageIndex,
      infiniteQuery.data?.pages.length,
      infiniteQuery.hasNextPage,
      infiniteQuery.isFetching,
      isInBeforeLastPage,
      isLastPageEmpty
    ]
  );
  if (!infiniteQuery.hasNextPage)
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_jsx_runtime5.Fragment, {});
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: cx(classNames?.container), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
          incrementCurrentPageIndex();
        });
      },
      className: cx(classNames?.loadMoreButton),
      children: "load more"
    }
  ) });
};
var TableLoadMore_default = TableLoadMore;

// src/CustomTable.tsx
var import_react_table = require("@tanstack/react-table");
var import_react5 = require("react");
var import_zustand5 = require("zustand");

// src/components/Filter.tsx
var import_zustand4 = require("zustand");
var import_react4 = require("react");
var import_jsx_runtime6 = require("react/jsx-runtime");
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}) {
  const [value, setValue] = (0, import_react4.useState)(initialValue);
  (0, import_react4.useEffect)(() => {
    setValue(initialValue);
  }, [initialValue]);
  (0, import_react4.useEffect)(() => {
    const timeout = setTimeout(() => {
      onChange(value.toString());
    }, debounce);
    return () => clearTimeout(timeout);
  }, [debounce, value]);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    "input",
    {
      ...props,
      value,
      onChange: (e) => setValue(e.target.value)
    }
  );
}
var isAFilter = (item) => !!(item && typeof item === "object");
function Filter({
  column,
  // table,
  store
}) {
  const filterByFormValues = (0, import_zustand4.useStore)(
    store,
    (state) => state.filterByFormValues
  );
  const columnFilterValue = (0, import_react4.useMemo)(() => column.getFilterValue(), [column]);
  const remoteFilter = (0, import_zustand4.useStore)(
    store,
    (state) => state.remoteFilter
  );
  const { setFilterByFormValues } = (0, import_zustand4.useStore)(
    store,
    (state) => state.utils
  );
  const _filterByFormValues = isAFilter(filterByFormValues) ? column.id in filterByFormValues && typeof filterByFormValues[column.id] === "object" && filterByFormValues[column.id] ? filterByFormValues[column.id] : void 0 : void 0;
  if (!_filterByFormValues)
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_jsx_runtime6.Fragment, {});
  if (_filterByFormValues.dataType === "text")
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      StringFilter,
      {
        column,
        filterByFormValues: _filterByFormValues,
        store,
        columnFilterValue,
        remoteFilter,
        setFilterByFormValues
      }
    );
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_jsx_runtime6.Fragment, {});
}
var StringFilter = ({
  column,
  filterByFormValues,
  // store,
  columnFilterValue,
  remoteFilter,
  setFilterByFormValues
}) => {
  const value = remoteFilter && column.id && filterByFormValues ? filterByFormValues.value ?? "" : columnFilterValue ?? "";
  const onChange = (0, import_react4.useCallback)(
    (value2) => {
      if (remoteFilter)
        return setFilterByFormValues((prevData) => {
          const filter = prevData[column.id];
          if (!filter)
            return prevData;
          return {
            ...prevData,
            [column.id]: !filter || filter?.dataType !== "text" ? filter : { ...filter, value: value2 }
          };
        });
      column.setFilterValue(value2);
    },
    [column, remoteFilter, setFilterByFormValues]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    DebouncedInput,
    {
      type: "text",
      value,
      onChange,
      className: "px-2 py-1 border rounded shadow w-36",
      list: column.id + "list",
      name: column.id
    }
  );
};
var Filter_default = Filter;

// src/CustomTable.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var ROW_SELECT = "row-select";
function IndeterminateCheckbox({
  indeterminate,
  className = "",
  ...props
}) {
  const ref = (0, import_react5.useRef)(null);
  (0, import_react5.useEffect)(() => {
    if (!ref.current)
      return;
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !props.checked && indeterminate;
    }
  }, [indeterminate, props.checked]);
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("input", { type: "checkbox", ref, className, ...props });
}
var CustomTable = ({
  infiniteQuery,
  store,
  canMultiRowSelect,
  ...props
}) => {
  const currentPageIndex = (0, import_zustand5.useStore)(store, (state) => state.currentPageIndex);
  const rowSelection = (0, import_zustand5.useStore)(store, (state) => state.rowSelection);
  const columnFilters = (0, import_zustand5.useStore)(store, (state) => state.columnFilters);
  const classNames = (0, import_zustand5.useStore)(store, (state) => state.classNames);
  const pageViewMode = (0, import_zustand5.useStore)(store, (state) => state.pageViewMode);
  const tableAutoToFixedOnLoad = (0, import_zustand5.useStore)(
    store,
    (state) => state.tableAutoToFixedOnLoad
  );
  const filterByFormValues = (0, import_zustand5.useStore)(
    store,
    (state) => state.filterByFormValues
  );
  const filterersKeysMap = (0, import_react5.useMemo)(
    () => Object.fromEntries(
      Object.keys(filterByFormValues || {}).map((key) => [key, true])
    ),
    [filterByFormValues]
  );
  const { setRowSelection, setColumnFilters } = (0, import_zustand5.useStore)(
    store,
    (state) => state.utils
  );
  const columns = (0, import_react5.useMemo)(() => {
    const columns2 = [
      ...props.columns.map((column) => ({
        ...column,
        enableColumnFilter: !!(column.accessorKey && filterersKeysMap[column.accessorKey])
      }))
    ];
    if (canMultiRowSelect)
      columns2.unshift({
        accessorKey: "ROW_SELECT",
        id: ROW_SELECT,
        enableHiding: true,
        header: ({ table: table2 }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: cx(classNames.thead?.th?.checkboxContainer?._), children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          IndeterminateCheckbox,
          {
            checked: table2.getIsAllRowsSelected(),
            indeterminate: table2.getIsSomeRowsSelected(),
            onChange: table2.getToggleAllRowsSelectedHandler(),
            className: cx(classNames.thead?.th?.checkboxContainer?.checkBox)
          }
        ) }),
        cell: ({ row }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: cx(classNames.tbody?.td?.checkboxContainer?._), children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          IndeterminateCheckbox,
          {
            checked: row.getIsSelected(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
            className: cx(classNames.tbody?.td?.checkboxContainer?.checkBox)
          }
        ) })
      });
    return columns2;
  }, [
    canMultiRowSelect,
    classNames.tbody?.td?.checkboxContainer?._,
    classNames.tbody?.td?.checkboxContainer?.checkBox,
    classNames.thead?.th?.checkboxContainer?._,
    classNames.thead?.th?.checkboxContainer?.checkBox,
    filterersKeysMap,
    props.columns
  ]);
  const currentPage = (0, import_react5.useMemo)(() => {
    if (pageViewMode === "INFINITE_SCROLL")
      return (infiniteQuery?.data?.pages || []).map((page) => page.items).flat(1);
    return infiniteQuery?.data?.pages?.[currentPageIndex]?.items || [];
  }, [currentPageIndex, infiniteQuery.data?.pages, pageViewMode]);
  const table = (0, import_react_table.useReactTable)({
    data: currentPage,
    columns,
    state: { columnFilters, rowSelection },
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: (0, import_react_table.getCoreRowModel)(),
    getFilteredRowModel: (0, import_react_table.getFilteredRowModel)(),
    enableColumnResizing: true,
    columnResizeMode: "onChange"
  });
  const isLoading = (0, import_react5.useMemo)(
    () => infiniteQuery.isInitialLoading || infiniteQuery.isFetchingNextPage || infiniteQuery.isFetchingPreviousPage,
    [
      infiniteQuery.isFetchingNextPage,
      infiniteQuery.isFetchingPreviousPage,
      infiniteQuery.isInitialLoading
    ]
  );
  (0, import_react5.useMemo)(() => {
    store.setState({ table });
  }, [store, table]);
  (0, import_react5.useEffect)(() => {
    if (infiniteQuery.isInitialLoading)
      setRowSelection({});
  }, [infiniteQuery.isInitialLoading, setRowSelection]);
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
    "table",
    {
      className: cx(classNames.table),
      style: {
        tableLayout: tableAutoToFixedOnLoad ? isLoading ? "auto" : "fixed" : void 0
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("thead", { className: cx(classNames.thead?._), children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("tr", { className: cx(classNames.thead?.tr), children: headerGroup.headers.map((header) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
          "th",
          {
            className: cx(classNames.thead?.th?._),
            style: {
              width: header.column.id === ROW_SELECT ? "min-content" : header.getSize(),
              paddingLeft: header.column.id === ROW_SELECT ? 0 : void 0,
              paddingRight: header.column.id === ROW_SELECT ? 0 : void 0
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "div",
                {
                  className: cx(classNames.thead?.th?.container),
                  children: header.isPlaceholder ? null : /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
                    (0, import_react_table.flexRender)(
                      header.column.columnDef.header,
                      header.getContext()
                    ),
                    header.column.getCanFilter() ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                      Filter_default,
                      {
                        column: header.column,
                        table,
                        store
                      }
                    ) }) : null
                  ] })
                }
              ),
              header.column.getCanResize() && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "div",
                {
                  onMouseDown: header.getResizeHandler(),
                  onTouchStart: header.getResizeHandler(),
                  className: cx(classNames.thead?.th?.resizeController),
                  style: {
                    backgroundColor: header.column.getIsResizing() ? "rgb(67 56 202 / var(--tw-bg-opacity, 1))" : "",
                    opacity: header.column.getIsResizing() ? 1 : ""
                  }
                }
              )
            ]
          },
          header.id
        )) }, headerGroup.id)) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
          "tbody",
          {
            className: cx(classNames.tbody?._),
            style: isLoading ? { position: "relative", isolation: "isolate" } : {},
            children: [
              table.getHeaderGroups()[0] && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "tr",
                {
                  className: cx(classNames.tbody?.loadingTr?._),
                  style: infiniteQuery.isFetching ? {
                    ...!infiniteQuery.isInitialLoading ? {
                      display: "flex",
                      position: "absolute",
                      flexDirection: "column",
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      zIndex: 2
                    } : {},
                    width: "100%",
                    height: "100%",
                    flexGrow: 1
                  } : { display: "none" },
                  children: table.getHeaderGroups()[0].headers.map((headers) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                    "td",
                    {
                      className: cx(classNames.tbody?.loadingTr?.td),
                      style: infiniteQuery.isFetching ? {
                        width: "100%",
                        height: "100%",
                        flexGrow: 1
                      } : {}
                    },
                    headers.id
                  ))
                }
              ),
              table.getRowModel().rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("tr", { className: cx(classNames.tbody?.tr), children: row.getVisibleCells().map((cell) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "td",
                {
                  className: cx(classNames.tbody?.td?._),
                  style: {
                    width: cell.column.id === ROW_SELECT ? "min-content" : cell.column.getSize(),
                    paddingLeft: cell.column.id === ROW_SELECT ? 0 : void 0,
                    paddingRight: cell.column.id === ROW_SELECT ? 0 : void 0
                  },
                  children: (0, import_react_table.flexRender)(cell.column.columnDef.cell, cell.getContext())
                },
                cell.id
              )) }, row.id))
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("tfoot", { className: cx(classNames.tfoot?._), children: table.getFooterGroups().map((footerGroup) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("tr", { className: cx(classNames.tfoot?.tr), children: footerGroup.headers.map((header) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "th",
          {
            className: cx(classNames.tfoot?.th),
            style: { width: header.column.getSize() },
            children: header.isPlaceholder ? null : (0, import_react_table.flexRender)(
              header.column.columnDef.footer,
              header.getContext()
            )
          },
          header.id
        )) }, footerGroup.id)) })
      ]
    }
  );
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CustomTable,
  TableLoadMore,
  TableMetaData,
  handleCreateTableStore,
  useCreateTableStore
});
//# sourceMappingURL=index.js.map