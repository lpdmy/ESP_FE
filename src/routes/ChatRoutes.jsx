import { Route } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import ChatPage from "@/pages/Chat/ChatPage";
import InboxPage from "@/pages/Chat/InboxPage";
import ProtectedRoute from "./ProtectedRoute";

export const chatRoutes = [
    <Route key="chat"  
    element={<ProtectedRoute />} >
        <Route key="chat-detail" path={ROUTES.CHAT.CHAT_PAGE} element={<ChatPage />} />
        <Route key="chat-inbox" path={ROUTES.CHAT.INBOX} element={<InboxPage />} />
    </Route>
];