import question from "../models/question.js";
import {
  awardAnswerPoints,
  deductAnswerPoints,
  deductDownvotePoints,
  refundDownvotePoints,
  checkAndAwardUpvoteBonus,
} from "./rewards.js";

// POST /answer/post/:id   (auth required)
export const postanswer = async (req, res) => {
  const { id: _id } = req.params;
  const { answerbody, useranswered } = req.body;
  const userid = req.userid;

  try {
    const answerdetail = await question.findById(_id);
    if (!answerdetail) return res.status(404).json({ message: "Question not found" });

    const answer = {
      answerbody,
      useranswered,
      userid,
      answeredon: new Date(),
      upvote: [],
      downvote: [],
      bonusAwarded: false,
    };
    answerdetail.answer.push(answer);
    answerdetail.noofanswer += 1;
    await answerdetail.save();

    // +5 points for posting an answer
    await awardAnswerPoints(userid);

    res.status(200).json({ data: answerdetail });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
  }
};

// DELETE /answer/delete/:id/:answerId   (auth required)
export const deleteanswer = async (req, res) => {
  const { id: _id, answerId } = req.params;

  try {
    const questionDoc = await question.findById(_id);
    if (!questionDoc) return res.status(404).json({ message: "Question not found" });

    const answerDoc = questionDoc.answer.id(answerId);
    const answerOwnerId = answerDoc ? answerDoc.userid : null;

    const updatedQuestion = await question.findByIdAndUpdate(
      _id,
      { $pull: { answer: { _id: answerId } } },
      { new: true }
    );
    await question.findByIdAndUpdate(_id, { $inc: { noofanswer: -1 } });

    // -5 points for deleted answer
    if (answerOwnerId) await deductAnswerPoints(answerOwnerId);

    res.status(200).json({ data: updatedQuestion });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
  }
};

// PATCH /answer/vote/:questionId/:answerId   (auth required)
// body: { value: "upvote" | "downvote", userid }
export const voteanswer = async (req, res) => {
  const { questionId, answerId } = req.params;
  const { value, userid } = req.body;

  if (!["upvote", "downvote"].includes(value)) {
    return res.status(400).json({ message: "Invalid vote value" });
  }

  try {
    const questionDoc = await question.findById(questionId);
    if (!questionDoc) return res.status(404).json({ message: "Question not found" });

    const answer = questionDoc.answer.id(answerId);
    if (!answer) return res.status(404).json({ message: "Answer not found" });

    const answerOwnerId = answer.userid;
    const upIndex = answer.upvote.findIndex((id) => id === String(userid));
    const downIndex = answer.downvote.findIndex((id) => id === String(userid));

    if (value === "upvote") {
      // Remove any existing downvote first
      if (downIndex !== -1) {
        answer.downvote = answer.downvote.filter((id) => id !== String(userid));
        // Refund the 2-point deduction since the downvote is being removed
        if (answerOwnerId) await refundDownvotePoints(answerOwnerId);
      }

      if (upIndex === -1) {
        // Add upvote
        answer.upvote.push(String(userid));
      } else {
        // Toggle off — remove upvote
        answer.upvote = answer.upvote.filter((id) => id !== String(userid));
      }
    } else if (value === "downvote") {
      // Remove any existing upvote first
      if (upIndex !== -1) {
        answer.upvote = answer.upvote.filter((id) => id !== String(userid));
      }

      if (downIndex === -1) {
        // Add downvote — deduct 2 points from answer owner
        answer.downvote.push(String(userid));
        if (answerOwnerId) await deductDownvotePoints(answerOwnerId);
      } else {
        // Toggle off — remove downvote, refund 2 points
        answer.downvote = answer.downvote.filter((id) => id !== String(userid));
        if (answerOwnerId) await refundDownvotePoints(answerOwnerId);
      }
    }

    await questionDoc.save();

    // Check if this answer just hit 5 upvotes → award +5 bonus
    let bonusAwarded = false;
    if (value === "upvote" && answerOwnerId) {
      bonusAwarded = await checkAndAwardUpvoteBonus(questionId, answerId);
    }

    res.status(200).json({ data: questionDoc, bonusAwarded });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};