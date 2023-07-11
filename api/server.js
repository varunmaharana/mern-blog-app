import express, { urlencoded } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/database.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import multer from "multer";
import fs from "fs";
import User from "./models/User.js";
import Post from "./models/Post.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use("/uploads", express.static(__dirname + "/uploads"));

dotenv.config({
	path: "./config/config.env",
});

const salt = bcrypt.genSaltSync(10);
const secret = "josdbfasd8f23hr923br32fi3d9d32bu8934rf";

const uploadMiddleware = multer({ dest: "uploads/" });

app.use(
	cors({
		credentials: true,
		origin: process.env.FRONTEND_URL,
		// methods: ["GET", "POST", "PUT", "DELETE"],
	})
);
app.use(express.json());
app.use(cookieParser());
app.use(
	urlencoded({
		extended: true,
	})
);

// DB Connect
connectDB();

app.post("/register", async (req, res) => {
	const { username, password } = req.body;
	try {
		const userDoc = await User.create({
			username,
			password: bcrypt.hashSync(password, salt),
		});
		res.json(userDoc);
	} catch (e) {
		res.status(400).json(e);
	}
});

app.post("/login", async (req, res) => {
	const { username, password } = req.body;
	const userDoc = await User.findOne({ username });
	const passOk = bcrypt.compareSync(password, userDoc.password);
	if (passOk) {
		// logged in
		// res.json(userDoc);
		jwt.sign(
			{
				username,
				id: userDoc._id,
			},
			secret,
			{},
			(err, token) => {
				if (err) throw err;
				res.cookie("token", token).json({
					username,
					id: userDoc._id,
				});
			}
		);
	} else {
		res.status(400).json("wrong credentials");
	}
});

app.get("/profile", (req, res) => {
	const { token } = req.cookies;
	jwt.verify(token, secret, {}, (err, info) => {
		if (err) throw err;
		res.json(info);
	});
	res.json(req.cookies);
});

app.post("/logout", (req, res) => {
	res.cookie("token", "").json("ok");
});

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
	const { originalname, path } = req.file;
	const parts = originalname.split(".");
	const ext = parts[parts.length - 1];
	const newPath = path + "." + ext;
	fs.renameSync(path, newPath);

	const { token } = req.cookies;
	jwt.verify(token, secret, {}, async (err, info) => {
		if (err) throw err;
		const { title, summary, content } = req.body;
		const postDoc = await Post.create({
			title,
			summary,
			content,
			cover: newPath,
			author: info.id,
		});
		res.json(postDoc);
	});
});

app.get("/post", async (req, res) => {
	const posts = await Post.find()
		.populate("author", ["username"])
		.sort({ createdAt: -1 })
		.limit(20);

	res.json(posts);
});

app.get("/post/:id", async (req, res) => {
	const { id } = req.params;
	const postDoc = await Post.findById(id).populate("author", ["username"]);
	res.json(postDoc);
});

app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
	let newPath = null;
	if (req.file) {
		const { originalname, path } = req.file;
		const parts = originalname.split(".");
		const ext = parts[parts.length - 1];
		newPath = path + "." + ext;
		fs.renameSync(path, newPath);
	}

	const { token } = req.cookies;
	jwt.verify(token, secret, {}, async (err, info) => {
		if (err) throw err;
		const { id, title, summary, content } = req.body;
		const postDoc = await Post.findById(id);
		const isAuthor =
			JSON.stringify(postDoc.author) === JSON.stringify(info.id);
		if (!isAuthor) {
			return res.status(400).json("you are not the author");
		}
		await postDoc.updateOne({
			title,
			summary,
			content,
			cover: newPath ? newPath : postDoc.cover,
		});

		// postDoc.u

		res.json(postDoc);
	});
});

app.listen(4000, () => {
	console.log("Server running at port 4000.");
});
