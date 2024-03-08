// server.js
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import multer from "multer"
import dotenv from "dotenv"
import main from "./app.js"
dotenv.config()
const app = express()
const PORT = 5000

// Configure multer for file storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/") // Set the directory where files will be saved
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname) // Naming convention for saved files
	},
})

const upload = multer({ storage: storage })
// Middleware
app.use(cors())
app.use(express.json())

// MongoDB connection
mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.log(err))

// MongoDB schema and model
const WalletSchema = new mongoose.Schema({
	nftMinter: String,
	nftAddressDevnet: String,
})
const nftMint = mongoose.model("nftMint", WalletSchema)

app.post("/api/mint", upload.single("image"), async (req, res) => {
	//I have to use multer and upload the image without that the req.body is emty for some reason?
	try {
		// console.log("File:", req.file) // Information about the file
		// console.log("ID:", req.body.id) // The 'id' field from the form data
		const fileName = req.file.originalname
		const id = req.body.id
		const addy = await main(fileName, id)
		const newMint = new nftMint({ nftMinter: id, nftAddressDevnet: addy })
		newMint.save()
		res.status(200).json(newMint)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

app.get("/api/mints", async (req, res) => {
	try {
		const mints = await nftMint.find({})
		res.status(200).json(mints)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
