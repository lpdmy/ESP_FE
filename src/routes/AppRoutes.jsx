import { Routes } from "react-router-dom";
import { landingRoutes } from "./LandingRoutes";
import { authRoutes } from "./AuthRoutes";
import { adminRoutes } from "./AdminRoutes";
import { profileRoutes } from "./UserProfileRoutes";
import { onboardingRoutes } from "./OnboardingRoutes";
import { collectionsRoutes} from "./CollectionRoutes";
import { clubRoutes } from "./ClubRoutes";
import { starPointRoutes } from "./StarPointRoutes";
import { chatRoutes } from "./ChatRoutes";
import { notificationRoutes } from "./NotificationRoutes";

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
      {...chatRoutes}
      {...notificationRoutes}
    </Routes>
  );
}