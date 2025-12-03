import ContentLayout from "@/common/components/layout/ContentLayout";
import ClassDetail from "./components/ClassDetail"
import LandingLayout from '@/common/components/layout/LandingLayout';

export default function MyClassesPage() {
  return (
    <LandingLayout>
      <ContentLayout>
        <ClassDetail />
      </ContentLayout>
    </LandingLayout>
  );
}

