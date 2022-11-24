import DB from "../DB.js";
import * as Page from "./Page.js";

const users = await DB.usersCollection();
const posts = await DB.postsCollection();

export async function getProfilePosts(req, res) {
  let number = req.body.number;

  let userInfo = req.userToken;
  let proba = await users
    .aggregate([{ $match: { username: req.userToken.username } }])
    .toArray();
  userInfo = proba[0];
  let username = req.body.profileName;
  if (userInfo.username == username) {
    userInfo.friends.push(username);
  }
  if (userInfo.friends_request.includes(username)) {
    return res.send({ return: "request" });
  }

  if (userInfo.friends_pending.includes(username)) {
    return res.send({ return: "pending" });
  }

  if (!userInfo.friends.includes(username)) {
    return res.send({ return: false });
  }

  if (userInfo.friends.includes(username)) {
    let skipPosts = 10 * (number - 1);
    let postPerPage = 10;
    let response = await posts
      .aggregate([
        {
          $match: {
            username: username,
          },
        },
        {
          $sort: {
            date: -1,
          },
        },
        {
          $skip: skipPosts,
        },
        {
          $limit: postPerPage,
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
      ])
      .toArray();
    if (userInfo.friends.includes(userInfo.username)) {
      response.unshift("me");
    }
    res.status(200).send(response);
  }
}

export async function addFriend(req, res) {
  let user = req.body.user;
  let userInfo = req.userToken;
  userInfo = await Page.getUserData(userInfo.username);
  if (
    !userInfo.friends.includes(user) &&
    !userInfo.friends_request.includes(user) &&
    !userInfo.friends_pending.includes(user)
  ) {
    let addFriend = await users.updateOne(
      {
        username: userInfo.username,
      },
      {
        $push: { friends_pending: user },
      }
    );
    let addUserFriend = await users.updateOne(
      {
        username: user,
      },
      {
        $push: { friends_request: userInfo.username },
      }
    );

    if (addFriend.modifiedCount == 1 && addUserFriend.modifiedCount == 1) {
      return res.send({ return: "success" });
    } else return res.send({ return: false });
  }
}

export async function removeFriend(req, res) {
  let user = req.body.user;
  let userInfo = req.userToken;
  userInfo = await Page.getUserData(userInfo.username);
  if (userInfo.friends.includes(user)) {
    let removeFriend = await users.updateOne(
      {
        username: userInfo.username,
      },
      {
        $pull: { friends: user },
      }
    );
    let removeUserFriend = await users.updateOne(
      {
        username: user,
      },
      {
        $pull: { friends: userInfo.username },
      }
    );
    if (
      removeFriend.modifiedCount == 1 &&
      removeUserFriend.modifiedCount == 1
    ) {
      return res.send({ response: "success" });
    } else return res.send({ response: false });
  }
}

export async function accept(req, res) {
  let user = req.body.user;
  let userInfo = req.userToken;
  userInfo = await Page.getUserData(userInfo.username);
  if (userInfo.friends_request.includes(user)) {
    let addFriend = await users.updateOne(
      {
        username: userInfo.username,
      },
      {
        $push: { friends: user },
      }
    );
    let removeFriend_request = await users.updateOne(
      {
        username: userInfo.username,
      },
      {
        $pull: { friends_request: user },
      }
    );
    let addUserFriend = await users.updateOne(
      {
        username: user,
      },
      {
        $push: { friends: userInfo.username },
      }
    );
    let removeUserFriend_pending = await users.updateOne(
      {
        username: user,
      },
      {
        $pull: { friends_pending: userInfo.username },
      }
    );

    if (
      addFriend.modifiedCount == true &&
      removeFriend_request.modifiedCount == true &&
      addUserFriend.modifiedCount == true &&
      removeUserFriend_pending.modifiedCount == true
    ) {
      return res.send({ response: "success" });
    } else return res.send({ response: false });
  }
}

export async function decline(req, res) {
  let user = req.body.user;
  let userInfo = req.userToken;
  userInfo = await Page.getUserData(userInfo.username);
  if (userInfo.friends_request.includes(user)) {
    let declineFriend = await users.updateOne(
      {
        username: userInfo.username,
      },
      {
        $pull: { friends_request: user },
      }
    );
    let declineUserFriend = await users.updateOne(
      {
        username: user,
      },
      {
        $pull: { friends_pending: userInfo.username },
      }
    );

    if (
      declineFriend.modifiedCount == 1 &&
      declineUserFriend.modifiedCount == 1
    ) {
      return res.send({ response: "success" });
    } else return res.send({ response: false });
  }
}

export async function removePending(req, res) {
  let user = req.body.user;
  let userInfo = req.userToken;
  userInfo = await Page.getUserData(userInfo.username);
  if (userInfo.friends_pending.includes(user)) {
    let removePending = await users.updateOne(
      {
        username: userInfo.username,
      },
      {
        $pull: { friends_pending: user },
      }
    );
    let removeUserRequest = await users.updateOne(
      {
        username: user,
      },
      {
        $pull: { friends_request: userInfo.username },
      }
    );

    if (
      removePending.modifiedCount == 1 &&
      removeUserRequest.modifiedCount == 1
    ) {
      return res.send({ return: "success" });
    } else return res.send({ return: false });
  }
}

export async function getProfilePage(req, res) {
  res.render("profile.html");
}

export async function getInfoAboutProfile(req, res) {
  try {
    let response = await users
      .find({ username: req.body.profileName })
      .toArray();
    delete response[0].password;
    delete response[0]._id;
    return res.send(response[0]);
  } catch (error) {
    return res.send(false);
  }
}
