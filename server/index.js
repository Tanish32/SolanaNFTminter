// server.js
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import multer from "multer"
import dotenv from "dotenv"
import main from "./app.js"
const app = express()

const PORT = 5000

dotenv.config()
app.use(cors())
const upload = multer({ storage: multer.memoryStorage() }) // Middleware
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
	try {
		const name = req.body.name
		const sybmol = req.body.symbol
		const id = req.body.id
		const imgBuffer = req.file.buffer
		const addy = await main(imgBuffer, name, id, sybmol)
		console.log("Out of Main function!")
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
app.get("/", (req, res) => {
	res.status(200).send("Server Alive!")
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
