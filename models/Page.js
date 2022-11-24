import DB from "../DB.js";
const users = await DB.usersCollection();

export async function homepage(req, res) {
  let returnObject = false;
  if (req.query.get == "yes") returnObject = true;
  let token = req.userToken;
  if (token) {
    if (returnObject) {
      return res.send(token);
    }
    return res.render("index.html");
  }
  res.render("login.html");
}

export async function getSearchResult(req, res) {
  let response = await users
    .find({ name: { $regex: `${req.body.input}`, $options: "i" } })
    .toArray();
  res.send(response);
}

export async function getUserData(username) {
  let response = await users.find({ username }).toArray();
  response = response[0];
  if (response) return response;
  else return false;
}

export async function getFriendsList(req, res) {
  let token = req.userToken;
  let getFriends = await users
    .aggregate([
      {
        $match: {
          username: {
            $in: token.friends,
          },
        },
      },
      {
        $sort: {
          name: 1,
        },
      },
    ])
    .toArray();
  for (let i of getFriends) {
    delete i.password;
    delete i.friends;
  }
  res.send(getFriends);
}
