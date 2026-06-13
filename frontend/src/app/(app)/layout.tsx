import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { Suspense } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<div className="w-[240px] bg-[#0A0A0A] border-r border-purple-500/10" />}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 ml-[240px]">
        <Navbar />
        <main className="p-6">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
