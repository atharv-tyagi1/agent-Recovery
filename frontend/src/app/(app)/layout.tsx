import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[240px]">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
