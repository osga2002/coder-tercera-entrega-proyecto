const express = require('express')
const { Router } = express
const authRouter = Router();

const isLoggedIn = (req, res, next) => {
	console.log("reqSession", req.session?.name);
	if (!req.session?.name) {
		res.redirect("/login");
		return;
	}
	next();
};

authRouter.get("/", (req, res) => {
	res.render("login");
});

authRouter.post("/", (req, res) => {
	const name = req.body.name;
	console.log("name:", name);
	if (!name || !name.length) {
		res.status(401).json({ error: "Datos ingresados inválidos" });
	}
	req.session.name = name;
	res.redirect("/");
});

module.exports = authRouter;
