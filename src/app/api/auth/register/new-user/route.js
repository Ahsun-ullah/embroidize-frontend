import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/connectDB";

export async function POST(request) {
  const { name, email, password } = await request.json();

  // Validate the input fields
  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "All fields are required!" },
      { status: 400 }
    );
  }

  try {
    const db = await connectDB();
    const userCollection = db.collection("users");

    // Check if the user already exists
    const existingUser = await userCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists!" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    await userCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(), // Consider adding createdAt for better user tracking
    });

    return NextResponse.json(
      { message: "User registered successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error); // Log the error for debugging
    return NextResponse.json(
      { message: "Something went wrong!", error: error.message }, // Send a simple error message
      { status: 500 }
    );
  }
}
