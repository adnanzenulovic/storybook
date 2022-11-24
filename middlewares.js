import DB from "./DB.js";
import * as User from "./models/User.js";
import validator from "validator";

const users = await DB.usersCollection();

export async function validateRegistration(req, res, next) {
  const usersData = req.body;

  let errors = {};
  if (!validator.isEmail(usersData.email)) {
    errors.email = "Your email format is not correct.";
  }
  if (usersData.password.length < 8) {
    errors.password = "Your password must be at least 8 characters.";
  }
  if (usersData.name.length < 3) {
    errors.name = "You must specify a name of at least 3 characters.";
  }
  if (usersData.username.length < 3) {
    errors.username = "You must specify a username of at least 3 characters.";
  }

  let check = await users
    .aggregate([
      {
        $match: {
          $or: [
            {
              username: usersData.username,
            },
            {
              name: usersData.name,
            },
          ],
        },
      },
    ])
    .toArray();
  if (check.length > 0) {
    errors.used = "Username or email is taken by another user";
  }
  if (Object.keys(errors).length > 0) {
    return res.send({ errors });
  } else next();
}

export async function validateToken(req, res, next) {
  let coockie = req.cookies.token;
  if (!coockie) {
    req.userToken = false;
    return next();
  }
  let token = await User.decoded(req.cookies.token);
  if (token) {
    req.userToken = token;
  } else {
    req.userToken = false;
  }
  next();
}
