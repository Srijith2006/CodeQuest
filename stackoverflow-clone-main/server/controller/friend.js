import user from "../models/auth.js";
import mongoose from "mongoose";

// POST /user/friend/request/:targetId  — send a friend request
export const sendFriendRequest = async (req, res) => {
  const fromId = req.userid;
  const { targetId } = req.params;

  if (fromId === targetId)
    return res.status(400).json({ message: "Cannot add yourself" });

  if (!mongoose.Types.ObjectId.isValid(targetId))
    return res.status(400).json({ message: "Invalid user id" });

  try {
    const target = await user.findById(targetId);
    if (!target) return res.status(404).json({ message: "User not found" });

    if (target.friends.includes(fromId))
      return res.status(400).json({ message: "Already friends" });

    if (target.friendRequests.includes(fromId))
      return res.status(400).json({ message: "Request already sent" });

    await user.findByIdAndUpdate(targetId, {
      $addToSet: { friendRequests: fromId },
    });
    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PATCH /user/friend/accept/:requesterId  — accept a pending request
export const acceptFriendRequest = async (req, res) => {
  const userId = req.userid;
  const { requesterId } = req.params;

  try {
    const currentUser = await user.findById(userId);
    if (!currentUser.friendRequests.includes(requesterId))
      return res.status(400).json({ message: "No such request" });

    // Add each other as friends & remove the pending request
    await user.findByIdAndUpdate(userId, {
      $pull: { friendRequests: requesterId },
      $addToSet: { friends: requesterId },
    });
    await user.findByIdAndUpdate(requesterId, {
      $addToSet: { friends: userId },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PATCH /user/friend/decline/:requesterId  — decline a pending request
export const declineFriendRequest = async (req, res) => {
  const userId = req.userid;
  const { requesterId } = req.params;
  try {
    await user.findByIdAndUpdate(userId, {
      $pull: { friendRequests: requesterId },
    });
    res.status(200).json({ message: "Request declined" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// DELETE /user/friend/remove/:friendId  — unfriend
export const removeFriend = async (req, res) => {
  const userId = req.userid;
  const { friendId } = req.params;
  try {
    await user.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await user.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
    res.status(200).json({ message: "Friend removed" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /user/friends/:id  — list friends + pending requests for a user
export const getFriends = async (req, res) => {
  const { id } = req.params;
  try {
    const currentUser = await user
      .findById(id)
      .select("friends friendRequests");
    if (!currentUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ data: currentUser });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};