"use client";

import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-slate-950 text-white font-sans overflow-hidden">
            <Sidebar />
            <main className="flex-1 relative overflow-y-auto h-screen pb-20 md:pb-0">

                {/* Background Ambience */}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-50 z-0">
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 p-4 md:p-8 max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
