const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(cookieParser());

const port = process.env.PORT || 5000;

//middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
const uri = process.env.MONGODB;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const foodCollection = client
      .db("restaurantManagement")
      .collection("foods");

    const purchaseCollection = client
      .db("restaurantManagement")
      .collection("Purchase");

    app.get("/foods", async (req, res) => {
      const foodName = req.query.name;
      const query = {};
      if (foodName) {
        query.food_name = { $regex: new RegExp(foodName, "i") };
      }

      try {
        const result = await foodCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching foods:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    app.post("/purchase", async (req, res) => {
      try {
        const purchaseData = req.body;

        if (!ObjectId.isValid(purchaseData.foodId)) {
          return res.status(400).json({ error: "Invalid foodId" });
        }

        // Insert the purchase data into the Purchase collection
        await purchaseCollection.insertOne(purchaseData);

        // Increment purchase count for the corresponding food item
        await foodCollection.updateOne(
          { _id: new ObjectId(purchaseData.foodId) },
          { $inc: { purchaseCount: 1 } }
        );

        res.status(201).json({ message: "Purchase data added successfully" });
      } catch (error) {
        console.error("Error adding purchase data:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Server is Running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
