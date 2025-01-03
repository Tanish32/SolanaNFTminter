import { Connection, Keypair, PublicKey } from "@solana/web3.js"
import {
	Metaplex,
	keypairIdentity,
	irysStorage,
	toMetaplexFile,
} from "@metaplex-foundation/js"
import dotenv from "dotenv"
import bs58 from "bs58"
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

async function uploadImage(imgBuffer, fileName) {
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
async function mintNft(
	metadataUri,
	name,
	sellerFee,
	symbol,
	creators,
	receiver
) {
	console.log(`Step 3 - Minting NFT`)
	const { nft } = await METAPLEX.nfts().create(
		{
			uri: metadataUri,
			name: name,
			sellerFeeBasisPoints: sellerFee,
			symbol: symbol,
			creators: creators,
			isMutable: false,
		},
		{ commitment: "finalized" }
	)
	console.log(`Transfering NFT to caller`)
	await METAPLEX.nfts().transfer({
		nftOrSft: nft,
		authority: WALLET,
		fromOwner: WALLET.publicKey,
		toOwner: receiver,
	})
	console.log(`   Success!🎉`)
	console.log(
		`   Minted NFT: https://explorer.solana.com/address/${nft.address}?cluster=devnet`
	)
	return `${nft.address}`
}
const CONFIG = {
	imgFileName: "image.png",
	imgType: "image/png",
	imgName: " Gang Wars",
	description: "",
	sellerFeeBasisPoints: 500, //500 bp = 5%
	symbol: "",
	creators: [{ address: WALLET.publicKey, share: 100 }],
}

export default async function main(imgBuffer, name, id, sybmol) {
	//change name of uploading file
	CONFIG.imgFileName = name
	// CONFIG.imgName = fileName.slice(0, -4) //THIS WAS THE PAIN POINT idk why this was not working !!!
	CONFIG.imgName = name
	CONFIG.symbol = sybmol
	const receiver = new PublicKey(id)
	CONFIG.creators[0].address = receiver
	console.log(`Minting ${CONFIG.imgName} to an NFT in Wallet ${id}.`)
	//Step 1 - Upload Image
	const imgUri = await uploadImage(imgBuffer, CONFIG.imgFileName)
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
		CONFIG.creators,
		CONFIG.creators[0].address
	)

	return tokenAddress
}
