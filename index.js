const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 3005;
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wsfcvqt.mongodb.net/?appName=Cluster0`;

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
    // await client.connect();

    const database = client.db("the_book_haven");
    const allBooksCollection = database.collection("allBooks");
    const commentsCollection = database.collection("userComments");

    // all book api
    app.get("/all-books", async (req, res) => {
      const { email, sortBy } = req.query;
      // search query
      const query = {};
      if (email) {
        query.userEmail = email;
      }
      // sort
      sortCondition = {};
      if (sortBy) {
        sortCondition[sortBy] = -1;
      }

      const cursor = allBooksCollection.find(query).sort(sortCondition);
      const result = await cursor.toArray();
      res.send(result);
    });

    // // search book
    app.get("/all-books/search", async (req, res) => {
      const searchText = req.query.title;
      const result = await allBooksCollection
        .find({ title: { $regex: searchText, $options: "i" } })
        .toArray();
      res.send(result);
    });
    
    // Enhanced backend API with more filters
    // app.get("/all-books", async (req, res) => {
    //   const {
    //     email,
    //     genre,
    //     author,
    //     sortBy,
    //     minRating,
    //     page = 1,
    //     limit = 8,
    //   } = req.query;

    //   // Build query
    //   const query = {};
    //   if (email) {
    //     query.userEmail = email;
    //   }
    //   if (genre) {
    //     query.genre = genre;
    //   }
    //   if (author) {
    //     query.author = author;
    //   }
    //   if (minRating) {
    //     query.rating = { $gte: parseFloat(minRating) };
    //   }

    //   // Build sort
    //   const sortCondition = {};
    //   if (sortBy) {
    //     const sortMap = {
    //       newest: { createdAt: -1 },
    //       oldest: { createdAt: 1 },
    //       rating: { rating: -1 },
    //       title: { title: 1 },
    //     };
    //     sortCondition = sortMap[sortBy] || { createdAt: -1 };
    //   } else {
    //     sortCondition = { createdAt: -1 };
    //   }

    //   // Pagination
    //   const skip = (parseInt(page) - 1) * parseInt(limit);

    //   try {
    //     const cursor = allBooksCollection.find(query).sort(sortCondition);
    //     const total = await cursor.count();
    //     const result = await cursor.skip(skip).limit(parseInt(limit)).toArray();

    //     res.send({
    //       books: result,
    //       total,
    //       page: parseInt(page),
    //       totalPages: Math.ceil(total / parseInt(limit)),
    //     });
    //   } catch (error) {
    //     res.status(500).send({ error: error.message });
    //   }
    // });

    // search book
    // app.get("/all-books/search", async (req, res) => {
    //   const { title, author, description } = req.query;

    //   const query = {};
    //   if (title) {
    //     query.title = { $regex: title, $options: "i" };
    //   }
    //   if (author) {
    //     query.author = { $regex: author, $options: "i" };
    //   }
    //   if (description) {
    //     query.description = { $regex: description, $options: "i" };
    //   }

    //   const result = await allBooksCollection.find(query).toArray();
    //   res.send(result);
    // });

   
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
      const fixed = { ...book, rating: Number(book.rating) };
      const result = await allBooksCollection.insertOne(fixed);
      res.send(result);
    });

    // book update api
    app.put("/all-books/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      const fixedData = { ...data, rating: Number(data.rating) };
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: fixedData,
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

    //  ****************
    // USER COMMENT DATA
    // *****************
    app.post("/comments", async (req, res) => {
      const comment = req.body;
      const result = await commentsCollection.insertOne(comment);
      res.send(result);
      console.log(comment);
    });

    // every single book comment
    app.get("/comments/:id", async (req, res) => {
      const { id } = req.params;
      const query = { bookId: id };
      const result = await commentsCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Server is running portt : ", port);
});
