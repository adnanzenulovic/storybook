import DB from "../DB.js";

const users = await DB.usersCollection();
const chatDB = await DB.chatDB();

export async function getInfoChat(req, res) {
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
    ])
    .toArray();
  for (let i of getFriends) {
    delete i.password;
  }
  token.friends = getFriends;
  res.send(token);
}

export async function sendMessage(req, res) {
  let token = req.userToken;

  let user = await users.find({ username: req.body.user }).toArray();
  if (user[0].name == [] || !token.friends.includes(user[0].username))
    return res.send({ error: "User is not your friend" });

  let collection = getCollectionName(user[0].username, token.username);
  let listCollections = await chatDB.listCollections().toArray();
  let exist = false;
  let data = {
    sender: token.username,
    senders_name: token.name,
    date: new Date(),
    message: req.body.text,
    recipent: user[0].username,
    recipents_name: user[0].name,
  };
  for (let i of listCollections) {
    if (i.name == collection) exist = true;
  }
  if (!exist) {
    chatDB.createCollection(collection, function (err, response) {
      if (err) {
        return res.send({ error: "Error..." });
      }
    });
  }
  try {
    const response = await chatDB.collection(collection).insertOne(data);
    if (response.acknowledged == true) res.send(true);
  } catch (error) {
    return res.send({ error: "Error..." });
  }
}

export async function getMessages(req, res) {
  let token = req.userToken;
  let collection = getCollectionName(req.query.user, token.username);
  let listCollections = await chatDB.listCollections().toArray();
  let exist = false;

  for (let i of listCollections) {
    if (i.name == collection) exist = true;
  }
  if (!exist) {
    chatDB.createCollection(collection, function (err, res) {
      if (err) {
        if (
          !err
            .toString()
            .includes("MongoServerError: Collection already exists")
        ) {
          throw err;
        }
      }
    });
  } else {
    let messages = await chatDB.collection(collection).find({}).toArray();
    return res.send(JSON.stringify(messages));
  }

  res.send(JSON.stringify(req.query.user));
}

function getCollectionName(a, b) {
  let result = "";
  let max = a.length >= b.length ? a.length : b.length;
  for (let i = 0; i < max; i++) {
    if (a[i] == undefined) {
      result = b + a;
      break;
    }
    if (b[i] == undefined) {
      result = a + b;
      break;
    }
    if (a[i] == b[i]) continue;
    if (a.charCodeAt(i) > b.charCodeAt(i)) {
      result = b + a;
      break;
    }
    if (b.charCodeAt(i) > a.charCodeAt(i)) {
      result = a + b;
      break;
    }
  }
  return result;
}

export async function getChatPage(req, res) {
  res.render("chat.html");
}
