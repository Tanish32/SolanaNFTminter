import { Connection, Keypair, PublicKey } from "@solana/web3.js"
import {
	Metaplex,
	keypairIdentity,
	irysStorage,
	toMetaplexFile,
	toBigNumber,
} from "@metaplex-foundation/js"
import * as fs from "fs"
import dotenv from "dotenv"
import bs58 from "bs58"
import { createMint } from "@solana/spl-token"
dotenv.config()
const SECRET = bs58.decode(process.env.SECRET)
const QUICKNODE_RPC =
	"https://solana-devnet.g.alchemy.com/v2/QEIRUH0OEQVORGB3FTNpvAAvhwuedwYq"
const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC)

const WALLET = Keypair.fromSecretKey(new Uint8Array(SECRET))

const METAPLEX = Metaplex.make(SOLANA_CONNECTION)
	.use(keypairIdentity(WALLET))
	.use(
		irysStorage({
			address: "https://devnet.bundlr.network",
			providerUrl: QUICKNODE_RPC,
			timeout: 60000,
		})
	)

async function uploadImage(imgBuffer, filePath, fileName) {
	console.log(`Step 1 - Uploading Image`)
	const imgMetaplexFile = toMetaplexFile(imgBuffer, fileName)
	const imgUri = await METAPLEX.storage().upload(imgMetaplexFile)
	console.log(`   Image URI:`, imgUri)

	return imgUri
}
async function uploadMetadata(
	imgUri,
	imgType,
	nftName,
	description,
	attributes
) {
	console.log(`Step 2 - Uploading Metadata`)
	const { uri } = await METAPLEX.nfts().uploadMetadata({
		name: nftName,
		description: description,
		image: imgUri,
		attributes: attributes,
		properties: {
			files: [
				{
					type: imgType,
					uri: imgUri,
				},
			],
		},
	})
	console.log("   Metadata URI:", uri)
	return uri
}
async function mintNft(metadataUri, name, sellerFee, symbol, creators) {
	console.log(`Step 3 - Minting NFT`)
	// const { nft } = await METAPLEX.nfts().create(
	// 	{
	// 		uri: metadataUri,
	// 		name: name,
	// 		sellerFeeBasisPoints: sellerFee,
	// 		symbol: symbol,
	// 		creators: creators,
	// 		isMutable: false,
	// 	},
	// 	{ commitment: "finalized" }
	// )
	const mint = await createMint(
		SOLANA_CONNECTION,

		WALLET, // payer

		WALLET.publicKey, // mint authority

		WALLET.publicKey, // freeze authority

		0 // Decimals for the token
	)
	console.log(`   Success!🎉`)
	console.log(
		`   Minted NFT: https://explorer.solana.com/address/${mint}?cluster=devnet`
	)
	return `${mint}`
}
const CONFIG = {
	uploadPath: "tmp/",
	imgFileName: "image.png",
	imgType: "image/png",
	imgName: "QuickNode Pixel",
	description: "Pixel infrastructure for everyone!",
	attributes: [
		{ trait_type: "Speed", value: "Quick" },
		{ trait_type: "Type", value: "Pixelated" },
		{ trait_type: "Background", value: "QuickNode Blue" },
	],
	sellerFeeBasisPoints: 500, //500 bp = 5%
	symbol: "",
	creators: [{ address: WALLET.publicKey, share: 100 }],
}

export default async function main(imgBuffer, fileName, id) {
	console.log(`Minting ${CONFIG.imgName} to an NFT in Wallet ${id}.`)
	//change name of uploading file
	CONFIG.imgFileName = fileName
	CONFIG.imgName = fileName.slice(0, -4)
	//Step 1 - Upload Image
	const imgUri = await uploadImage(
		imgBuffer,
		CONFIG.uploadPath,
		CONFIG.imgFileName
	)
	//Step 2 - Upload Metadata
	const metadataUri = await uploadMetadata(
		imgUri,
		CONFIG.imgType,
		CONFIG.imgName,
		CONFIG.description,
		CONFIG.attributes
	)
	//Step 3 - Mint NFT
	const tokenAddress = await mintNft(
		metadataUri,
		CONFIG.imgName,
		CONFIG.sellerFeeBasisPoints,
		CONFIG.symbol,
		CONFIG.creators
	)

	return tokenAddress
}
