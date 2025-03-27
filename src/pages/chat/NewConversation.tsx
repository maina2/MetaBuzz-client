// import { useState } from "react";
// import { useAppSelector } from "../../redux/hooks";
// import axios from "axios";

// interface User {
//   id: number;
//   username: string;
//   email: string;
// }

// const API_BASE = "http://127.0.0.1:8000";

// const NewConversation = ({ onConversationCreated }: { onConversationCreated: () => void }) => {
//   const token = useAppSelector((state) => state.auth.token);
//   const currentUser = useAppSelector((state) => state.auth.user);
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState<User[]>([]);
//   const [error, setError] = useState("");

//   const searchUsers = async () => {
//     try {
//       const res = await axios.get(`http://127.0.0.1:8000/messages/search/?q=${query}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setResults(res.data.users);
//       setError("");
//     } catch (err: any) {
//       setError("Error searching users");
//     }
//   };

//   const startConversation = async (userId: number) => {
//     try {
//       await axios.post(
//         `http://127.0.0.1:8000/messages/conversations/`,
//         { participants: [userId] },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       onConversationCreated(); // Refresh conversation list
//       setQuery("");
//       setResults([]);
//     } catch (err: any) {
//       setError("Conversation already exists or failed to create");
//     }
//   };

//   return (
//     <div className="mb-4">
//       <input
//         className="border p-2 w-full"
//         type="text"
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         placeholder="Search users..."
//       />
//       <button onClick={searchUsers} className="bg-blue-500 text-white px-4 py-2 mt-2">
//         Search
//       </button>

//       {results.map((user) => (
//         <div key={user.id} className="mt-2 p-2 border flex justify-between items-center">
//           <span>{user.username}</span>
//           <button
//             onClick={() => startConversation(user.id)}
//             className="bg-green-500 text-white px-2 py-1"
//           >
//             Start Chat
//           </button>
//         </div>
//       ))}

//       {error && <p className="text-red-500 mt-2">{error}</p>}
//     </div>
//   );
// };

// export default NewConversation;
