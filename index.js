const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 3000;
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World");
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.wsfcvqt.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    const database = client.db("the_book_haven");
    const allBooksCollection = database.collection("allBooks");

    // all book api
    app.get("/all-books", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.userEmail = email;
      }
      const cursor = allBooksCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // latest book api
    app.get("/latest-books", async (req, res) => {
      const cursor = allBooksCollection.find().sort({ createdAt: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // every single book details
    app.get("/book-details/:id", async (req, res) => {
      const { id } = req.params;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await allBooksCollection.findOne(query);
      // console.log(result);
      res.send(result);
    });

    // book adding api
    app.post("/all-books", async (req, res) => {
      const book = req.body;
      const result = await allBooksCollection.insertOne(book);
      res.send(result);
    });

    // book update api
    app.put("/all-books/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      console.log({ id, data });
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: data,
      };
      const result = await allBooksCollection.updateOne(query, update);
      res.send(result);
    });

    // book delete api
    app.delete("/book-delete/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await allBooksCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Server is running port : ", port);
});
