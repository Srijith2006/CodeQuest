import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getFriends,
} from "../controller/friend.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/:id", getFriends);
router.post("/request/:targetId", auth, sendFriendRequest);
router.patch("/accept/:requesterId", auth, acceptFriendRequest);
router.patch("/decline/:requesterId", auth, declineFriendRequest);
router.delete("/remove/:friendId", auth, removeFriend);

export default router;