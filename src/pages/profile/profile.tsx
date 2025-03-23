import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  fetchUserProfile,
  updateUserProfile,
  clearProfileState,
} from "../../redux/features/profile/profileSlice";
import UserPosts from "./UserPosts";

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error, updateSuccess } = useSelector(
    (state: RootState) => state.profile
  );

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    phone: "",
    profile_picture: null as File | null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        bio: user.bio || "",
        phone: user.phone || "",
        profile_picture: null,
      });

      if (user.profile_picture) {
        setPreviewImage(`${user.profile_picture}`);
      } else {
        setPreviewImage(null);
      }
    }
  }, [user]);

  // Add effect to handle successful update
  useEffect(() => {
    if (updateSuccess) {
      setEditMode(false); // Close the edit form

      // Clear the success state after a delay
      const timer = setTimeout(() => {
        dispatch(clearProfileState());
      }, 3000); // Clear success message after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [updateSuccess, dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === "profile_picture" && files && files[0]) {
      setFormData({ ...formData, profile_picture: files[0] });
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = new FormData();

    // Only add fields that have values or have changed
    if (formData.first_name !== user?.first_name)
      updatedData.append("first_name", formData.first_name);
    if (formData.last_name !== user?.last_name)
      updatedData.append("last_name", formData.last_name);
    if (formData.bio !== user?.bio) updatedData.append("bio", formData.bio);
    if (formData.phone !== user?.phone)
      updatedData.append("phone", formData.phone);
    if (formData.profile_picture) {
      updatedData.append("profile_picture", formData.profile_picture);
    }

    dispatch(updateUserProfile(updatedData));
  };

  const handleCancel = () => {
    // Reset form data to current user data
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        bio: user.bio || "",
        phone: user.phone || "",
        profile_picture: null,
      });

      if (user.profile_picture) {
        setPreviewImage(`${user.profile_picture}`);
      } else {
        setPreviewImage(null);
      }
    }

    setEditMode(false);
    // Clear any previous errors
    dispatch(clearProfileState());
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Profile Image or Initial */}
        {previewImage ? (
          <div className="relative group">
            <img
              src={previewImage}
              alt="Profile"
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow-md"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
              <span className="text-white text-sm font-medium">Change</span>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-md">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
              <span className="text-white text-sm font-medium">Add Photo</span>
            </div>
          </div>
        )}

        {/* User Information */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {user?.username}
              </h1>
              <p className="text-sm text-gray-500 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
                {user?.email}
              </p>
            </div>


          </div>

          {/* Stats */}
          <div className="flex space-x-6 pt-2">
            <div className="text-center px-3 py-1 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">
                {user?.followers_count || 0}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Followers
              </p>
            </div>
            <div className="text-center px-3 py-1 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">
                {user?.following_count || 0}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Following
              </p>
            </div>
          </div>

          {/* Bio and Phone */}
          <div className="pt-2 space-y-2">
            {user?.bio ? (
              <p className="text-gray-700">{user.bio}</p>
            ) : (
              <p className="text-gray-400 italic">No bio provided</p>
            )}

            {user?.phone && (
              <p className="text-sm text-gray-600 flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  ></path>
                </svg>
                {user.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      {!editMode ? (
        <>
          <button
            onClick={() => setEditMode(true)}
            className="mt-4 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            Edit Profile
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block font-medium">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="mt-1 w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block font-medium">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="mt-1 w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block font-medium">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block font-medium">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="mt-1 w-full border rounded p-2"
              rows={3}
            />
          </div>

          <div>
            <label className="block font-medium">Profile Picture</label>
            <input
              type="file"
              name="profile_picture"
              accept="image/*"
              onChange={handleChange}
              className="mt-1 w-full border rounded p-2"
            />
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {updateSuccess && (
        <p className="text-green-600 font-medium">
          Profile updated successfully!
        </p>
      )}
      {user?.id && (
        <div className="mt-10">
          <UserPosts userId={user.id} />
        </div>
      )}
    </div>
  );
};

export default Profile;
