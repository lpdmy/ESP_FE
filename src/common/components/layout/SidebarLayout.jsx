import Sidebar from '@/features/landing/components/Sidebar';
import Header from '@/features/landing/components/Header';

export default function SidebarLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex">
                <div className="w-80 p-6 space-y-6">
                    <Sidebar />
                </div>
                <div className="flex-1 p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}