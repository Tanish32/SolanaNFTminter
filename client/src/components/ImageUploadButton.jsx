// src/components/ImageUploadButton.js
import React, { useState } from "react"
import axios from "axios"
import ConnectWalletButton from "./ConnectWalletButton"

function ImageUploadButton() {
	const [image, setImage] = useState(null)
	const [userAddress, setUserAddress] = useState("")

	const uploadImageHandler = (e) => {
		setImage(e.target.files[0])
	}

	const mintNFT = async () => {
		alert("Creating NFT please wait.")

		if (!image) return
		const formData = new FormData()
		formData.append("image", image)
		formData.append("id", userAddress)

		const response = await axios.post(
			"http://localhost:5000/api/mint",
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		)
		console.log(response.data)
		console.log(
			`   Minted NFT: https://explorer.solana.com/address/${response.data.nftAddressDevnet}?cluster=devnet`
		)

		alert(
			`   Minted NFT: https://explorer.solana.com/address/${response.data.nftAddressDevnet}?cluster=devnet`,
			"check console for more details."
		)
	}

	const getNFTS = async () => {
		alert("Check console for all NFT data.")
		axios
			.get("http://localhost:5000/api/mints")
			.then((response) => {
				console.log(response.data) // Process your data here
			})
			.catch((error) => {
				console.error("Error fetching data: ", error)
			})
	}

	return (
		<div>
			<ConnectWalletButton
				userAddress={userAddress}
				setUserAddress={setUserAddress}
			/>
			<input type="file" onChange={uploadImageHandler} />
			<button onClick={mintNFT}>Mint NFT</button>
			<button onClick={getNFTS}>Get All NFTs API</button>
		</div>
	)
}

export default ImageUploadButton
