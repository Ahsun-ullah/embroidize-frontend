"use client";
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from "@heroui/react";
import React from "react";
import UserTable from "../../../components/Common/Table";

import { VerticalDotsIcon } from "@/components/icons";
import { statusColorMap } from "@/utils/colorStatus/page";
import { capitalize } from "@/utils/functions/page";

const AllProductsListPage = () => {
  const data = [
    // Sample data as you already defined...
    {
      id: 1,
      name: "John Doe",
      age: 30,
      role: "Admin",
      team: "Team A",
      email: "john@example.com",
      status: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      age: 25,
      role: "User",
      team: "Team B",
      email: "jane@example.com",
      status: "paused",
    },
    {
      id: 3,
      name: "Sarah Brown",
      age: 40,
      role: "Manager",
      team: "Team C",
      email: "sarah@example.com",
      status: "vacation",
    },
    {
      id: 4,
      name: "Michael Johnson",
      age: 32,
      role: "Admin",
      team: "Team A",
      email: "michael@example.com",
      status: "active",
    },
    {
      id: 5,
      name: "Emily Davis",
      age: 29,
      role: "User",
      team: "Team B",
      email: "emily@example.com",
      status: "paused",
    },
    {
      id: 6,
      name: "David Wilson",
      age: 35,
      role: "Manager",
      team: "Team C",
      email: "david@example.com",
      status: "active",
    },
    // More sample data...
  ];

  const [searchValue, setSearchValue] = React.useState("");

  const onSearchChange = (value) => {
    setSearchValue(value);
  };

  const columns = [
    { name: "ID", uid: "id" },
    { name: "NAME", uid: "name", sortable: true },
    { name: "AGE", uid: "age", sortable: true },
    { name: "ROLE", uid: "role", sortable: true },
    { name: "TEAM", uid: "team" },
    { name: "EMAIL", uid: "email" },
    { name: "STATUS", uid: "status" },
    { name: "ACTIONS", uid: "actions" },
  ];

  const renderCell = React.useCallback((user, columnKey) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", src: user.avatar }}
            description={user.email}
            name={cellValue}
          >
            {user.email}
          </User>
        );

      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[user.status]}
            size="sm"
            variant="flat"
          >
            {capitalize(user.status)}
          </Chip>
        );

      case "role":
        return <span>{capitalize(user.role)}</span>;

      case "team":
        return <span>{capitalize(user.team)}</span>;

      case "email":
        return <a href={`mailto:${user.email}`}>{user.email}</a>;

      case "age":
        return <span>{user.age} years</span>;

      case "id":
        return <span>{user.id}</span>;

      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <VerticalDotsIcon className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="edit" onClick={() => {}}>
                  Edit
                </DropdownItem>
                <DropdownItem key="delete" onClick={() => {}}>
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      default:
        return cellValue;
    }
  });

  return (
    <div className="flex flex-col gap-3">
      <h1>All Products</h1>
      <UserTable
        data={data}
        columns={columns}
        pageSize={5}
        onSearchChange={onSearchChange}
        renderCell={renderCell}
      />
    </div>
  );
};

export default AllProductsListPage;
