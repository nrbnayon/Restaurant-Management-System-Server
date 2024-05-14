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
    await client.connect();

    const foodCollection = client
      .db("restaurantManagement")
      .collection("foods");

    const purchaseCollection = client
      .db("restaurantManagement")
      .collection("Purchase");

    const feedbackCollection = client
      .db("restaurantManagement")
      .collection("feedbacks");
    //get top selling foods
    app.get("/topFoods", async (req, res) => {
      try {
        const topFoods = await foodCollection
          .find({})
          .sort({ purchaseCount: -1 })
          .limit(6)
          .toArray();

        res.json(topFoods);
      } catch (error) {
        console.error("Error fetching top foods:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    //get all foods
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

    // update food
    app.post("/updateFood/:id", async (req, res) => {
      try {
        const foodId = req.params.id;
        const updatedFoodData = req.body;
        if (!ObjectId.isValid(foodId)) {
          return res.status(400).json({ error: "Invalid foodId" });
        }
        const { _id, ...updatedDataWithoutId } = updatedFoodData;
        const query = { _id: new ObjectId(foodId) };
        const result = await foodCollection.updateOne(query, {
          $set: updatedDataWithoutId,
        });
        if (result.modifiedCount === 0) {
          return res.status(404).json({ error: "Food item not found" });
        }

        res.json({ message: "Food item updated successfully" });
      } catch (error) {
        console.error("Error updating food item:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.post("/addFood", async (req, res) => {
      const newFood = req.body;
      try {
        const result = await foodCollection.insertOne(newFood);
        res.json(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Error" });
      }
    });

    // my purchase
    app.post("/purchase", async (req, res) => {
      try {
        const purchaseData = req.body;

        if (!ObjectId.isValid(purchaseData.foodId)) {
          return res.status(400).json({ error: "Invalid foodId" });
        }

        const foodId = new ObjectId(purchaseData.foodId);

        // Get the food item details
        const foodItem = await foodCollection.findOne({ _id: foodId });

        // Check if the quantity of the food item is sufficient for the purchase
        if (foodItem.quantity < purchaseData.quantity) {
          return res.status(400).json({ error: "Insufficient quantity" });
        }

        // Calculate the total sales
        // const totalSales = foodItem.totalSeals + purchaseData.quantity;
        const purchaseQuantity = parseInt(purchaseData.quantity);

        // Increment purchase count for the corresponding food item
        await foodCollection.updateOne(
          { _id: foodId },
          {
            $inc: {
              purchaseCount: 1,
              totalSeals: purchaseQuantity,
            },
            $set: {
              quantity: foodItem.quantity - purchaseData.quantity,
            },
          }
        );

        // Insert the purchase data into the Purchase collection
        await purchaseCollection.insertOne(purchaseData);

        res.status(201).json({ message: "Purchase data added successfully" });
      } catch (error) {
        console.error("Error adding purchase data:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/myPurchase", async (req, res) => {
      let query = {};
      const { buyerName, buyerProfileUrl, buyerEmail } = req.query;

      if (buyerName && buyerProfileUrl) {
        query = { buyerName, buyerProfileUrl };
      } else if (buyerEmail !== undefined) {
        query = { buyerEmail };
      } else {
        return res.json([]);
      }

      try {
        const myPurchaseFoods = await purchaseCollection.find(query).toArray();
        res.json(myPurchaseFoods);
      } catch (error) {
        console.error("Error fetching my Purchase foods:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // delete from my purchase
    app.post("/myPurchase/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log("delete id", id);
        const query = { _id: new ObjectId(id) };

        const deletedPurchase = await purchaseCollection.findOne(query);
        const deletedQuantity = parseInt(deletedPurchase.quantity);

        await foodCollection.updateOne(
          { _id: new ObjectId(deletedPurchase.foodId) },
          { $inc: { quantity: deletedQuantity } }
        );
        const result = await purchaseCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error deleting food item:", error);
        res.status(500).send("Error deleting food item");
      }
    });

    app.get("/feedbacks", async (req, res) => {
      const feedbacks = await feedbackCollection.find().toArray();
      res.json(feedbacks);
    });

    app.post("/feedback", async (req, res) => {
      await feedbackCollection.insertOne(req.body);
      res.json({ message: "Feedback added" });
    });

    app.get("/myAddedFoods", async (req, res) => {
      let query = {};
      const { userName, photoUrl, userEmail } = req.query;

      if (userName && photoUrl) {
        query = { userName, photoUrl };
      } else if (userEmail !== undefined) {
        query = { userEmail };
      } else {
        return res.json([]);
      }

      try {
        const myAddedFoods = await foodCollection.find(query).toArray();
        res.json(myAddedFoods);
      } catch (error) {
        console.error("Error fetching user's added foods:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    //delete added food
    app.post("/myAddedFoods/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log("delete id", id);
        const query = { _id: new ObjectId(id) };

        const result = await foodCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error deleting food item:", error);
        res.status(500).send("Error deleting food item");
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
