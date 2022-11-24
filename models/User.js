import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DB from "../DB.js";

const users = await DB.usersCollection();

export default class User {
  constructor(usersData) {
    this.name = usersData.name;
    this.email = usersData.email;
    this.profilePicture = "default.jpg";
    this.friends = [];
    this.friends_panding = [];
    this.friends_request = [];
  }

  static async login(req, res) {
    const { email, password } = req.body;

    let userData = await users.findOne({ email: email });
    if (!userData) {
      return res.send({ errors: { error: "Bad email" } });
    }

    if (!(await bcrypt.compare(password, userData.password))) {
      return res.send({ errors: { error: "Password is not correct" } });
    }
    delete userData.password;
    res.cookie("token", await encoded(userData));
    return res.send(userData);
  }

  static async register(req, res) {
    const usersData = req.body;
    let user = new User(usersData);
    user.password = await hashPassword(usersData.password);

    try {
      let insertResult = await users.insertOne(user);
      user._id = insertResult.insertedId;
      delete user.password;
      res.cookie("token", await encoded({ ...user }));
      return res.send(user);
    } catch (e) {
      errors.e = "Internal error, please try again later";
      return res.status(400).json(errors);
    }
  }
}

export async function encoded(obj) {
  return jwt.sign(obj, process.env.JWT_SECRET_KEY, {
    expiresIn: "7 days",
  });
}

export async function decoded(userJwt) {
  try {
    let object = jwt.verify(userJwt, process.env.JWT_SECRET_KEY);
    delete object.iat;
    delete object.exp;
    return object;
  } catch (error) {
    return false;
  }
}

export async function hashPassword(password) {
  await bcrypt.hash(password, 10);
}
