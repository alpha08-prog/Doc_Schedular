"use client";
import { usePathname } from "next/navigation";
import BottomNavBar from "./BottomNavBar";

const BottomNavWrapper = () => {
  const pathname = usePathname();
  // Hide BottomNavBar on login and otp pages
  if (pathname === "/login" || pathname === "/otp") {
    return null;
  }
  return <BottomNavBar />;
};

export default BottomNavWrapper; 