import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  fetchUserProfile,
  updateUserProfile,
  clearProfileState,
} from "../../redux/features/profile/profileSlice";

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
    if (formData.bio !== user?.bio) 
      updatedData.append("bio", formData.bio);
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
      <div className="flex items-center space-x-4">
        {previewImage ? (
          <img
            src={previewImage}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-white">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold">{user?.username}</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <div className="text-sm mt-1">
            <span className="mr-4 font-medium">Followers:</span> {user?.followers_count}
            <span className="ml-6 mr-4 font-medium">Following:</span> {user?.following_count}
          </div>
        </div>
      </div>

      {!editMode ? (
        <>
          <p className="mt-4 text-gray-600">{user?.bio || "No bio provided."}</p>
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
        <p className="text-green-600 font-medium">Profile updated successfully!</p>
      )}
    </div>
  );
};

export default Profile;