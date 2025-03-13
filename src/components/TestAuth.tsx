import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store"; // Import RootState type
import { loginUser, logoutUser } from "../redux/features/auth/authSlice";

const TestAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogin = () => {
    dispatch(
      loginUser({ email: "test@example.com", password: "password123" }) as any
    );
  };

  const handleLogout = () => {
    dispatch(logoutUser() as any);
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-semibold">Auth Test Component</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {isAuthenticated ? (
        <>
          <p>Logged in as: {user?.username}</p>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        </>
      ) : (
        <>
          <p>Not logged in</p>
          <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
            Login
          </button>
        </>
      )}
    </div>
  );
};

export default TestAuth;
