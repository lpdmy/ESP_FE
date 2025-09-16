import SidebarLayout from '@/common/components/layout/SidebarLayout';
import StudentProfile from '@/features/user-profile/components/StudentProfile/StudentProfile';

export default function StudentProfilePage() {
  return (
    <SidebarLayout>
      <StudentProfile />
    </SidebarLayout>
  );
}
