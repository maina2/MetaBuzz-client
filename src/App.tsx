import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/profile";
// import ConversationList from "./pages/chat/ConversationList";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import PostDetail from "./pages/posts/PostDetail";
import UserProfileView from "./pages/profile/UserProfileView";
import ConversationView from "./pages/chat/ConveresationView";
import MessagesLayout from "./pages/chat/MessagesLayout";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/posts/:postId" element={<PostDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<UserProfileView />} />
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
          {/* <Route path="/messages" element={<ConversationList />} />
          <Route
            path="/conversation/:conversationId"
            element={<ConversationView />}
          /> */}
        </Route>

        {/* Routes without Sidebar & Navbar (Auth Pages) */}
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
