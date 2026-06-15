import user from "../models/auth.js";
import question from "../models/question.js";

// ── Award 5 points when a user posts an answer ───────────────────────────────
export const awardAnswerPoints = async (userId) => {
  await user.findByIdAndUpdate(userId, { $inc: { points: 5 } });
};

// ── Deduct 5 points when an answer is deleted ────────────────────────────────
export const deductAnswerPoints = async (userId) => {
  const foundUser = await user.findById(userId);
  if (!foundUser) return;
  const newPoints = Math.max(0, foundUser.points - 5);
  await user.findByIdAndUpdate(userId, { points: newPoints });
};

// ── Deduct 2 points when an answer receives a downvote ───────────────────────
export const deductDownvotePoints = async (userId) => {
  const foundUser = await user.findById(userId);
  if (!foundUser) return;
  const newPoints = Math.max(0, foundUser.points - 2);
  await user.findByIdAndUpdate(userId, { points: newPoints });
};

// ── Reverse the 2-point downvote deduction if a downvote is removed ──────────
export const refundDownvotePoints = async (userId) => {
  await user.findByIdAndUpdate(userId, { $inc: { points: 2 } });
};

// ── Award +5 bonus points the moment an answer reaches 5 upvotes ─────────────
// Called from voteanswer() in answer.js after every upvote toggle.
// Guards with `bonusAwarded` flag so it only ever fires once per answer.
export const checkAndAwardUpvoteBonus = async (questionId, answerId) => {
  const q = await question.findById(questionId);
  if (!q) return false;

  const answer = q.answer.id(answerId);
  if (!answer) return false;

  const upvoteCount = Array.isArray(answer.upvote) ? answer.upvote.length : 0;

  if (upvoteCount >= 5 && !answer.bonusAwarded) {
    // Award the bonus
    await user.findByIdAndUpdate(answer.userid, { $inc: { points: 5 } });
    answer.bonusAwarded = true;
    await q.save();
    return true; // bonus awarded
  }

  // If upvotes dropped back below 5 after bonus was given, we keep the
  // bonus (rewards already earned shouldn't be clawed back on un-vote —
  // only explicit downvotes/deletions deduct points, per spec).
  return false;
};

// ── GET /rewards/leaderboard ──────────────────────────────────────────────────
export const getLeaderboard = async (req, res) => {
  try {
    const users = await user.find().select("name points").sort({ points: -1 }).limit(20);
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ── GET /rewards/mypoints  (auth required) ────────────────────────────────────
export const getMyPoints = async (req, res) => {
  try {
    const foundUser = await user.findById(req.userid).select("name points");
    res.status(200).json({ data: foundUser });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ── POST /rewards/transfer  (auth required) ───────────────────────────────────
export const transferPoints = async (req, res) => {
  const fromId = req.userid;
  const { toUserId, amount } = req.body;

  if (!toUserId || !amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid transfer details" });
  }
  if (fromId === toUserId) {
    return res.status(400).json({ message: "Cannot transfer points to yourself" });
  }

  try {
    const sender = await user.findById(fromId);
    if (!sender) return res.status(404).json({ message: "User not found" });

    // Spec: transfers only allowed if sender has MORE THAN 10 points
    if (sender.points <= 10) {
      return res.status(403).json({
        message: "You need more than 10 points to transfer. Keep contributing!",
      });
    }
    if (amount > sender.points) {
      return res.status(400).json({ message: "Insufficient points" });
    }

    const recipient = await user.findById(toUserId);
    if (!recipient) return res.status(404).json({ message: "Recipient not found" });

    await user.findByIdAndUpdate(fromId, { $inc: { points: -amount } });
    await user.findByIdAndUpdate(toUserId, { $inc: { points: amount } });

    res.status(200).json({
      message: `Successfully transferred ${amount} points to ${recipient.name}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};