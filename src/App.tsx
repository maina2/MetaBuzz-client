import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/profile";
// import ConversationList from "./pages/chat/ConversationList";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import PostDetail from "./pages/posts/PostDetail";
// import UserProfileView from "./pages/profile/UserProfileView";
import ConversationView from "./pages/chat/ConveresationView";
import MessagesLayout from "./pages/chat/MessagesLayout";
import UserProfile from "./pages/profile/UserProfile/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
<Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/posts/:postId" element={<PostDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<UserProfile />} />
              <Route path="/messages" element={<MessagesLayout />}>
                <Route
                  index
                  element={
                    <div className="p-6 text-gray-500">
                      Select a conversation to start chatting
                    </div>
                  }
                />
                <Route
                  path="conversation/:conversationId"
                  element={<ConversationView />}
                />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
  );
}

export default App;
