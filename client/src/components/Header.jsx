import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { UserContext } from "../utils/UserContext";

const Header = () => {
	const { userInfo, setUserInfo } = useContext(UserContext);
	// const [redirect, setRedirect] = useState(false);

	useEffect(() => {
		fetch("http://localhost:4000/profile", {
			credentials: "include",
		}).then((response) => {
			response.json().then((userInfo) => {
				setUserInfo(userInfo);
			});
		});
	}, []);

	const logout = () => {
		fetch("http://localhost:4000/logout", {
			method: "POST",
			credentials: "include",
		});
		setUserInfo(null);
		// setRedirect(true);
		// return <Navigate to="/" />;
	};

	// if (redirect) {
	// 	return <Navigate to="/" />;
	// }

	const username = userInfo?.username;

	return (
		<header>
			<Link to="/" className="logo">
				MyBlog
			</Link>
			<nav>
				{username ? (
					<>
						<Link to="/create">Create new post</Link>
						<Link to="/login" onClick={logout}>Logout</Link>
					</>
				) : (
					<>
						<Link to="/login">Login</Link>
						<Link to="/register">Register</Link>
					</>
				)}
			</nav>
		</header>
	);
};

export default Header;
