import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const userRegister = async (req, res) => {
  try {
    const { username, name, email, password, address, number } = req.body;
    if (!username || !name || !email || !password || !address || !number) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        address,
        number,
      },
    });

    const token = generateToken(newUser, res);

    const userData = { ...newUser };
    delete userData.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userData,
      token: token,
    });
  } catch (error) {
    console.error("Error saat registrasi:", error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = generateToken(user, res);
    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    res.status(200).json({
      message: "Login successful",
      user: userData,
      token: token,
    });
  } catch (error) {
    console.error("Error when login:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const userUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "User ID is required in URL" });
    }

    const { username, name, email, address, number } = req.body;
    if (!username || !name || !email || !address || !number) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username,
        name,
        email,
        address,
        number,
      },
    });

    const { password, ...userData } = updatedUser;

    res.status(200).json({
      message: "User updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Error occurred while updating user:", error);
    res.status(500).json({ error: "An error occurred while updating user" });
  }
};

export const userDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error occurred while deleting user:", error);
    res.status(500).json({ error: "An error occurred while deleting user" });
  }
};

export const showProfile = async (req, res) => {
  try {
    const userID = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userID },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        address: true,
        number: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "User profile retrived succesfully",
      user: user,
    });
  } catch (error) {
    console.error("Error occurred while retrieving user profile:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving user profile" });
  }
};

export const getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 50;
  const MAX_PAGE_SIZE = 200;
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        address: true,
        number: true,
      },
      skip: (page - 1) * pageSize,
      take: Math.min(pageSize, MAX_PAGE_SIZE),
      orderBy: { id: "asc" },
    });
    res.status(200).json({
      message: "Users retrieved successfully",
      users: users,
    });
  } catch (error) {
    console.error("Error occurred while retrieving users:", error);
    res.status(500).json({ error: "An error occurred while retrieving users" });
  }
};
