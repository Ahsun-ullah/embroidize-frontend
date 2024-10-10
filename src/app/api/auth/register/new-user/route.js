import connectDB from "../../../../../lib/connectDB";

export const POST = async (request) => {
  try {
    const db = await connectDB();
    const userCollection = db.collection("users");

    const newUser = await request.json();

    const res = await userCollection.insertOne(newUser);

    if (res.acknowledged) {
      return new Response(
        JSON.stringify({ message: "New User Created Successfully." }),
        {
          status: 201,
        }
      );
    } else {
      return new Response(
        JSON.stringify({ message: "Failed to create user!" }),
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    return new Response(JSON.stringify({ message: "Something Went Wrong!" }), {
      status: 500,
    });
  }
};
