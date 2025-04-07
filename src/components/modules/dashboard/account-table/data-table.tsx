"use client"

import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Icons } from "@/components/common/icons"
import IosLoadingSpinner from "@/components/common/ios-loading-spinner"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  defaultSorting?: SortingState
}

const sortingIcons = {
  asc: <Icons.arrowDownNarrowWide className="h-4 w-4" />,
  desc: <Icons.arrowUpNarrowWide className="h-4 w-4" />,
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  defaultSorting,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(defaultSorting || [])

  const [pagination, setPagination] = useState({
    pageSize: 50,
    pageIndex: 0,
  })

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: true,
    state: {
      sorting,
      pagination,
    },
  })

  const totalPage = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex

  const isMinPage = currentPage === 0
  const isMaxPage = currentPage === totalPage - 1

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        minWidth: header.getSize() ? header.getSize() : 0,
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {header.column.getIsSorted() &&
                          sortingIcons[
                            header.column.getIsSorted() as "asc" | "desc"
                          ]}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? <IosLoadingSpinner /> : "Rỗng 🌌"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination>
        <PaginationContent className="overflow-x-scroll">
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                !isMinPage &&
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex - 1,
                }))
              }
              className={
                isMinPage ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            />
          </PaginationItem>
          {new Array(totalPage).fill(null).map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                className="cursor-pointer"
                isActive={i === currentPage}
                onClick={() => setPagination({ pageIndex: i, pageSize: 50 })}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                !isMaxPage &&
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex + 1,
                }))
              }
              className={
                isMaxPage ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  )
}
