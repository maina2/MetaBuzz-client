import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { markAsRead } from "../../redux/features/notifications/notificationsSlice";

const NotificationComponent = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.notifications);

  const handleMarkAsRead = (id: number) => {
    dispatch(markAsRead(id));
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <h2 className="text-lg font-bold mb-2">Notifications</h2>
      {notifications.length > 0 ? (
        <ul className="max-h-60 overflow-y-auto">
          {notifications.map((notification) => (
            <li key={notification.id} className="p-2 border-b flex justify-between items-center">
              <span className={notification.is_read ? "text-gray-400" : "text-gray-800"}>
                {notification.message}
              </span>
              {!notification.is_read && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="text-blue-500 text-sm"
                >
                  Mark as Read
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No new notifications.</p>
      )}
    </div>
  );
};

export default NotificationComponent;
