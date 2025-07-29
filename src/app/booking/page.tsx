"use client";
import React from "react";
import { useRouter } from "next/navigation";
import EmptyAppointments from "../components/appointment/EmptyAppointments";
import TopBar from "../components/common/TopBar";
import Tabs from "../components/common/Tabs";
import CardContainer from "../components/common/CardContainer";
import IconButton from "../components/common/IconButton";

export default function BookingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState(0);
  // Mock: no appointments

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-2">
      <CardContainer>
        {/* Top Bar */}
        <TopBar
          title="My Appointments"
          right={
            <>
              <IconButton ariaLabel="Search">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400"><circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" /></svg>
              </IconButton>
              <IconButton ariaLabel="Profile">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400"><circle cx="12" cy="7" r="4" strokeWidth="2" /><path d="M6 21v-2a4 4 0 014-4h0a4 4 0 014 4v2" strokeWidth="2" strokeLinecap="round" /></svg>
              </IconButton>
            </>
          }
        />
        {/* Tabs */}
        <Tabs
          tabs={["Upcoming", "Completed", "Canceled"]}
          activeIndex={activeTab}
          onChange={setActiveTab}
          className="px-6 md:px-0"
        />
        {/* Main Content */}
        <div className="flex flex-col items-center justify-center h-[60vh] px-4 md:px-12">
          <EmptyAppointments onBook={() => router.push("/")} />
        </div>
      </CardContainer>
    </div>
  );
} 