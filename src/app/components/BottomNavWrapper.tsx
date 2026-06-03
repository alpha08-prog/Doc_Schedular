"use client";
import { usePathname } from "next/navigation";
import BottomNavBar from "./BottomNavBar";

const BottomNavWrapper = () => {
  const pathname = usePathname();
  // Hide BottomNavBar on the auth pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }
  return <BottomNavBar />;
};

export default BottomNavWrapper;
