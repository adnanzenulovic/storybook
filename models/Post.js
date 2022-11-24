import { ObjectId } from "mongodb";
import DB from "../DB.js";

const posts = await DB.postsCollection();

export async function getPosts(req, res) {
  let number = req.body.number;
  let user = req.userToken;

  let globalPosts = {
    $match: {
      isGlobal: true,
    },
  };
  let friendsPosts = {
    $match: {
      username: { $in: user.friends },
    },
  };

  let skipPosts = 10 * (number - 1);
  let postPerPage = 10;
  let response = await posts

    .aggregate([
      req.body.isGlobal ? globalPosts : friendsPosts,
      {
        $sort: {
          date: -1,
        },
      },
      {
        $skip: skipPosts,
      },
      {
        $lookup: {
          from: "users",
          localField: "email",
          foreignField: "email",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
        },
      },
      {
        $limit: postPerPage,
      },
    ])
    .toArray();

  res.status(200).send(response);
}

export async function post(req, res) {
  let userInfo = req.userToken;
  userInfo.text = req.body.text;
  userInfo.isGlobal = req.body.isGlobal;
  let post = {
    name: userInfo.name,
    userId: userInfo._id,
    email: userInfo.email,
    text: userInfo.text,
    date: new Date(),
    likes: [],
    comments: [],
    username: userInfo.username,
    isGlobal: userInfo.isGlobal,
    user: userInfo,
    profilePicture: userInfo.profilePicture,
  };

  try {
    const response = await posts.insertOne(post);
    const currentPost = await posts
      .aggregate([
        { $match: { _id: response.insertedId } },
        {
          $lookup: {
            from: "users",
            localField: "email",
            foreignField: "email",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
          },
        },
      ])
      .toArray();
    return res.send(currentPost[0]);
  } catch (e) {
    res.send({
      error: { error: "Internal error, please try again later" },
    });
  }
}

export async function like(req, res) {
  let id = req.body.id;

  try {
    let userInfo = req.userToken;
    let response = await posts.findOne({ _id: ObjectId(id) });
    let liked = false;
    for (let i of response.likes) {
      if (i._id == userInfo._id) liked = true;
    }
    if (liked) {
      let response = await posts.findOneAndUpdate(
        { _id: ObjectId(id) },
        { $pull: { likes: userInfo } },
        { returnDocument: "after" }
      );
      res.send(response.value);
    } else {
      let response = await posts.findOneAndUpdate(
        { _id: ObjectId(id) },
        { $push: { likes: userInfo } },
        { returnDocument: "after" }
      );

      res.send(response.value);
    }
  } catch (error) {
    res.send({
      error: { error: "Internal error, please try again later" },
    });
  }
}

export async function postComment(req, res) {
  try {
    let comment = req.userToken;
    comment.comment = req.body.text;
    let response = await posts.findOneAndUpdate(
      { _id: ObjectId(req.body.id) },
      { $push: { comments: comment } }
    );
    res.send(comment);
  } catch (error) {
    res.send({
      error: { error: "Internal error, please try again later" },
    });
  }
}

export async function showLikesAndComments(req, res) {
  try {
    let postInfo = await posts.findOne({ _id: ObjectId(req.body.id) });
    res.send(postInfo);
  } catch (error) {
    res.send({
      error: { error: "Internal error, please try again later" },
    });
  }
}
