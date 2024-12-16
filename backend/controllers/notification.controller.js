import { Notification } from "../model/notification.model.js";
export const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) return res.status(404).json({ error: "User Not Found" });
    const userNotifications = await Notification
      .find({ to: userId })
      .populate({ path: "from", select: "username profileImg" });
    if (userNotifications && userNotifications.length > 0) {
      await Notification.updateMany({ to: userId }, { read: true });
      return res.status(200).json(userNotifications);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    return res.status(404).json({ error: "Error In getting notifications" });
  }
};
export const deleteAllNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) return res.status(404).json({ error: "User not found" });

    const deletedNotifications = await Notification.deleteMany({ to: userId });

    if (deletedNotifications.deletedCount === 0) {
      return res.status(200).json({ msg: "No notifications to delete",});
    }
    return res.status(200).json({ msg: "Notifications deleted successfully" ,});
  } catch (error) {
    return res.status(500).json({ error: "Error in deleting notifications" });
  }
};
export const deleteANotification = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) return res.status(404).json({ error: "User Not Found" });
    const { id: notificationId } = req.params;
    const userNotifications = await Notification.findOne({
      _id: notificationId,
      to: userId,
    });
    if (userNotifications.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "Your Not allowed to delete this notication" });
    }
    await Notification.findByIdAndDelete(notificationId);
    return res
      .status(200)
      .json({ message: "notification deleted sucessfully" });
  } catch (error) {
    return res.status(404).json({ error: "Error in deleting Notifications" });
  }
};
