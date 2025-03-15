import {
  Avatar,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from "@heroui/react";
import Link from "next/link";

const ProfileDropdown = ({ userData }) => {
  return (
    <Dropdown placement={userData?.isUser ? "bottom-start" : "bottom-end"}>
      <DropdownTrigger>
        {userData?.isUser ? (
          <User
            as="button"
            avatarProps={{
              isBordered: true,
              src: userData?.avatarSrc,
            }}
            className="transition-transform"
            description={userData?.description}
            name={name}
          />
        ) : (
          <Avatar
            isBordered
            as="button"
            className="transition-transform"
            src={userData?.avatarSrc}
          />
        )}
      </DropdownTrigger>
      <DropdownMenu
        aria-label={`${userData?.isUser ? "User" : "Profile"} Actions`}
        variant="flat"
      >
        <DropdownItem key="profile" className="h-14 gap-2">
          <p className="font-semibold">{userData?.position ?? "User Name"}</p>
          <p className="font-semibold">{userData?.email ?? "user@gmail.com"}</p>
        </DropdownItem>
        <DropdownItem>
          <Divider />
        </DropdownItem>

        <DropdownItem key="logout" color="danger">
          <Link href={"/auth/login"}>
            <span className="font-semibold">Log Out</span>
          </Link>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;
