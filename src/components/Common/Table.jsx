'use client';
import {
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { useMemo, useState } from 'react';

const UserTable = ({
  data,
  columns,
  pageSize,
  renderCell,
  onSearchChange,
  pagination,
  onPageChange,
  topContent,
}) => {
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));

  const paginatedItems = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const pages = pagination?.totalPages || 1;
  const currentPage = pagination?.currentPage || 1;

  const defaultTopContent = (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between gap-3 items-end'>
        <Input
          isClearable
          className='w-full sm:max-w-[44%]'
          placeholder='Search by name...'
          onValueChange={onSearchChange}
          onClear={() => onSearchChange('')}
        />
      </div>
    </div>
  );

  const finalTopContent = topContent || defaultTopContent;

  const bottomContent = pages > 1 && (
    <div className='py-2 px-2 flex justify-between items-center'>
      <Pagination
        isCompact
        showControls
        showShadow
        color='primary'
        page={currentPage}
        total={pages}
        onChange={onPageChange}
      />
    </div>
  );

  return (
    <>
      <Table
        isHeaderSticky
        aria-label='Example table with custom cells, pagination, and sorting'
        bottomContent={bottomContent}
        topContent={finalTopContent}
        selectedKeys={selectedKeys}
        selectionMode='multiple'
        onSelectionChange={setSelectedKeys}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={paginatedItems} emptyContent='No data found'>
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => (
                <TableCell className='table-cell self-center'>
                  {renderCell(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default UserTable;
