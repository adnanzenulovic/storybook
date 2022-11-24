import { Router } from "express";
import * as page from "./models/Page.js";
import user from "./models/User.js";
import * as posts from "./models/Post.js";
import * as profile from "./models/Profile.js";
import * as chat from "./models/Chat.js";
import dotenv from "dotenv";
dotenv.config();

const router = new Router();

//page
router.get("/", page.homepage);
router.get("/getInfoAboutUser", page.homepage);
router.get("/getFriendsList", page.getFriendsList);
router.post("/getSearchResult", page.getSearchResult);

//post
router.post("/getPosts", posts.getPosts);
router.post("/like", posts.like);
router.post("/post", posts.post);
router.post("/showLikesAndComments", posts.showLikesAndComments);
router.post("/postComment", posts.postComment);

//users
router.post("/login", user.login);
router.post("/register", user.register);

//profile
router.get("/profile/:id?", profile.getProfilePage);
router.post("/getProfilePosts", profile.getProfilePosts);
router.post("/accept", profile.accept);
router.post("/decline", profile.decline);
router.post("/addFriend", profile.addFriend);
router.post("/removePending", profile.removePending);
router.post("/removeFriend", profile.removeFriend);
router.post("/getInfoAboutProfile", profile.getInfoAboutProfile);

//chat
router.get("/chat", chat.getChatPage);
router.get("/getInfoChat", chat.getInfoChat);
router.get("/getMessages", chat.getMessages);
router.post("/sendMessage", chat.sendMessage);

export default router;
