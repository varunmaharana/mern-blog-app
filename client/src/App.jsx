import React from "react";
import { Routes, Route } from "react-router-dom";
import { UserContextProvider } from "./utils/UserContext";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import CreatePost from "./pages/CreatePost";
import PostPage from "./pages/PostPage";
import EditPost from "./pages/EditPost";

import "./App.css";

function App() {
	return (
		<UserContextProvider>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route path="/" element={<HomePage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/create" element={<CreatePost />} />
					<Route path="/post/:id" element={<PostPage />} />
					<Route path="/edit/:id" element={<EditPost />} />
				</Route>
			</Routes>
		</UserContextProvider>
	);
}

export default App;
