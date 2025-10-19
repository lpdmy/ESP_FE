import Header from "@/features/landing/components/Header";
import RightPanel from "@/features/landing/components/RightPanel";
import Sidebar from "@/features/landing/components/Sidebar";
import { useSelector } from "react-redux";
import { ROLE } from "@/common/constants/roles";

export default function FullLayout({ children }) {
  const user = useSelector((state) => state.user.user);
  const isStudent = user?.role === ROLE.STUDENT;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <Header />
      <main className="flex-1">
        <div className="w-full py-6">
          <div className="w-full px-4">
            <div className="flex gap-8 justify-center">
              {/* Sidebar */}
              <aside className="hidden lg:block w-64 xl:w-72 sticky top-[88px] self-start flex-shrink-0">
                <Sidebar />
              </aside>

              {/* Main + RightPanel */}
              <div className="flex flex-1 gap-6 justify-center">
                {/* Main content (tự giãn khi mất RightPanel) */}
                <section
                  className={`min-w-0 ${
                    isStudent ? "lg:max-w-4xl xl:max-w-4xl" : "lg:max-w-5xl xl:max-w-5xl"
                  } flex-1`}
                >
                  {children}
                </section>
         
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
