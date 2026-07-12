import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const app = express();

const PORT = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI as string;

app.use(cors());
app.use(express.json());


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


    const db = client.db("Eco-world")
    const AddProducts = db.collection("addproduct");
    const FavouriteCollection = db.collection("wishlist")


//  add products ar jnno

    app.post("/products",async(req,res)=>{
      const body = req.body;
      const result = await AddProducts.insertOne(body)
      res.send(result)
    })

  app.get("/products", async (req, res) => {
  try {
    const {
      search,
      pickupAddress,
      parcelType,
      category,
      priceRange,
      sort,
    } = req.query;

    const query: any = {};

    // Search by Product Name
    if (search) {
      query.productName = {
        $regex: search,
        $options: "i",
      };
    }

    // Search by Pickup Address
    if (pickupAddress) {
      query.pickupAddress = {
        $regex: pickupAddress,
        $options: "i",
      };
    }

    // Filter by Parcel Type
    if (parcelType) {
      query.parcelType = parcelType;
    }

    // Filter by Category
    if (category) {
      query.category = category;
    }

    // Filter by Price Range
    if (priceRange) {
      const [min, max] = (priceRange as string)
        .split("-")
        .map(Number);

      query.price = {
        $gte: min,
        $lte: max,
      };
    }

    // Sort
    let sortOption: any = { _id: -1 };

    if (sort === "low") {
      sortOption = { price: 1 };
    }

    if (sort === "high") {
      sortOption = { price: -1 };
    }

    const products = await AddProducts.find(query)
      .sort(sortOption)
      .toArray();

    res.send(products);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Server Error",
    });
  }
});

// product manage korar jnno

app.patch("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = req.body;

    const result = await AddProducts.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateData,
      }
    );

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Update failed" });
  }
});


app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await AddProducts.deleteOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Delete failed" });
  }
});

// dynamic product dkhar jnno
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await AddProducts.findOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch product" });
  }
});

// fav ar jnno
app.post("/favourite", async (req, res) => {
  const favourite = req.body;

  const exists = await FavouriteCollection.findOne({
    productId: favourite.productId,
    userEmail: favourite.userEmail,
  });

  if (exists) {
    return res.send({
      message: "Already added to favourite",
    });
  }

  const result = await FavouriteCollection.insertOne(favourite);

  res.send(result);
});


 app.get("/favourite",async(req,res)=>{
      const result = await FavouriteCollection.find().toArray()
      res.send(result)
    })


    app.delete("/favourite/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await FavouriteCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Delete failed" });
  }
});


// filter purpose
// GET http://localhost:5000/products




    await client.db("admin").command({ ping: 1 });

    console.log("✅ MongoDB Connected");

    app.get("/", (req: Request, res: Response) => {
      res.send("🚀 Eco World Backend Running");
    });







    app.listen(PORT, () => {
      console.log(`🚀 Server Running http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
}

run();