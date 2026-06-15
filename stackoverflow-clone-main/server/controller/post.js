import post from "../models/post.js";
import user from "../models/auth.js";

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns how many posts the calling user may make today based on friend count.
 *  0 friends  → 0  (cannot post)
 *  1 friend   → 1  per day
 *  2 friends  → 2  per day
 * >10 friends → unlimited (Infinity)
 *  3-10       → 2  per day  (falls under "at least two" rule)
 */
function dailyPostLimit(friendCount) {
  if (friendCount === 0) return 0;
  if (friendCount >= 1 && friendCount < 2) return 1;
  if (friendCount >= 2 && friendCount <= 10) return 2;
  return Infinity; // > 10
}

async function postsToday(userId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return post.countDocuments({ userId, createdAt: { $gte: start, $lte: end } });
}

// ─── controllers ──────────────────────────────────────────────────────────────

// GET /post/getallposts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await post.find().sort({ createdAt: -1 });
    res.status(200).json({ data: posts });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// POST /post/create  (auth required)
export const createPost = async (req, res) => {
  const { caption, mediaUrl, mediaType } = req.body;
  const userId = req.userid;

  if (!mediaUrl || !mediaType) {
    return res.status(400).json({ message: "Media is required" });
  }

  try {
    const currentUser = await user.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const friendCount = currentUser.friends.length;
    const limit = dailyPostLimit(friendCount);

    if (limit === 0) {
      return res.status(403).json({
        message:
          "You need at least 1 friend to post on the public page. Connect with others first!",
      });
    }

    if (limit !== Infinity) {
      const count = await postsToday(userId);
      if (count >= limit) {
        return res.status(403).json({
          message: `You have reached your daily post limit (${limit} post${
            limit > 1 ? "s" : ""
          } per day). Add more friends to unlock more posts!`,
        });
      }
    }

    const newPost = await post.create({
      caption,
      mediaUrl,
      mediaType,
      userId,
      userName: currentUser.name,
    });

    res.status(201).json({ data: newPost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PATCH /post/like/:id  (auth required)
export const likePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.userid;
  try {
    const found = await post.findById(id);
    if (!found) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = found.likes.includes(userId);
    const updated = await post.findByIdAndUpdate(
      id,
      alreadyLiked
        ? { $pull: { likes: userId } }
        : { $addToSet: { likes: userId } },
      { new: true }
    );
    res.status(200).json({ data: updated });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// POST /post/comment/:id  (auth required)
export const commentOnPost = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.userid;
  if (!text) return res.status(400).json({ message: "Comment text required" });

  try {
    const currentUser = await user.findById(userId);
    const updated = await post.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: { text, userId, userName: currentUser.name },
        },
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Post not found" });
    res.status(200).json({ data: updated });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PATCH /post/share/:id  (no auth needed – anyone can share)
export const sharePost = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await post.findByIdAndUpdate(
      id,
      { $inc: { shares: 1 } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Post not found" });
    res.status(200).json({ data: updated });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// DELETE /post/:id  (auth required — only owner)
export const deletePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.userid;
  try {
    const found = await post.findById(id);
    if (!found) return res.status(404).json({ message: "Post not found" });
    if (found.userId !== userId)
      return res.status(403).json({ message: "Not authorized" });
    await post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};