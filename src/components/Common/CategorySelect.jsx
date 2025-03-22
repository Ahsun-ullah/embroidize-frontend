import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import React, { useMemo, useState } from 'react';

const CategorySelect = () => {
  const [selectedKeys, setSelectedKeys] = useState(new Set(['All Categories']));

  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(', ').replaceAll('_', ' '),
    [selectedKeys]
  );

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="" className="capitalize font-semibold text-white">
          {selectedValue}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Single selection example"
        variant="flat"
        disallowEmptySelection
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
      >
        <DropdownItem key="All Categories" className="capitalize">
          All Categories
        </DropdownItem>
        <DropdownItem key="text" className="capitalize">
          Text
        </DropdownItem>
        <DropdownItem key="number" className="capitalize">
          Number
        </DropdownItem>
        <DropdownItem key="date" className="capitalize">
          Date
        </DropdownItem>
        <DropdownItem key="single_date" className="capitalize">
          Single Date
        </DropdownItem>
        <DropdownItem key="iteration" className="capitalize">
          Iteration
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default CategorySelect;
