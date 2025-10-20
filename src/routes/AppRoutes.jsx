import { Routes } from "react-router-dom";
import { landingRoutes } from "./LandingRoutes";
import { authRoutes } from "./AuthRoutes";
import { adminRoutes } from "./AdminRoutes";
import { profileRoutes } from "./UserProfileRoutes";
import { onboardingRoutes } from "./OnboardingRoutes";
import { collectionsRoutes} from "./CollectionRoutes";
import { clubRoutes } from "./ClubRoutes";
import { starPointRoutes } from "./StarPointRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {...landingRoutes}
      {...authRoutes}
      {...adminRoutes}
      {...profileRoutes}
      {...onboardingRoutes}
      {...collectionsRoutes}
      {...clubRoutes}
      {...starPointRoutes}
    </Routes>
  );
}