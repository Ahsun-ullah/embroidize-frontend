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

const UserTable = ({ data, columns, pageSize, renderCell, onSearchChange }) => {
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [page, setPage] = useState(1);

  // console.log(data);

  const selectedKeysArray = Array.from(selectedKeys);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return data?.slice(start, end);
  }, [data, page, pageSize]);

  const pages = Math.ceil(data?.length / pageSize);

  const topContent = (
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

  const bottomContent = pages > 1 && (
    <div className='py-2 px-2 flex justify-between items-center'>
      <Pagination
        isCompact
        showControls
        showShadow
        color='primary'
        page={page}
        total={pages}
        onChange={setPage}
      />
    </div>
  );

  return (
    <div className='overflow-x-auto'>
      <Table
        isHeaderSticky
        aria-label='Example table with custom cells, pagination, and sorting'
        bottomContent={bottomContent}
        topContent={topContent}
        selectedKeys={selectedKeys}
        selectionMode='multiple'
        onSelectionChange={setSelectedKeys}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={paginatedItems} emptyContent='No users found'>
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
    </div>
  );
};

export default UserTable;
