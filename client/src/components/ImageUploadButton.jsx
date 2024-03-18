// src/components/ImageUploadButton.js
import React, { useState } from "react"
import axios from "axios"
import ConnectWalletButton from "./ConnectWalletButton"

function ImageUploadButton() {
	const [image, setImage] = useState(null)
	const [userAddress, setUserAddress] = useState("")
	const [imgName, setImgName] = useState("")
	const [symbol, setSymbol] = useState("")
	const [isButtonDisabled, setIsButtonDisabled] = useState(false)
	const uploadImageHandler = (e) => {
		setImage(e.target.files[0])
	}
	const handleSubmit = (event) => {
		event.preventDefault()
		console.log("Username:", imgName)
	}

	const mintNFT = async () => {
		alert("Creating NFT please wait.")
		setIsButtonDisabled(true)
		if (!image) return
		console.log(image)
		const formData = new FormData()
		formData.append("image", image)
		formData.append("id", userAddress)
		formData.append("name", imgName)
		formData.append("symbol", symbol)
		const response = await axios.post(
			"https://sol-nft-server.onrender.com/api/mint",
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

		alert(` Minted NFT: Check console for more details.`)
		setIsButtonDisabled(false)
	}

	const getNFTS = async () => {
		alert("Check console for all NFT data.")
		axios
			.get("https://sol-nft-server.onrender.com/api/mints")
			.then((response) => {
				console.log(response.data) // Process your data here
			})
			.catch((error) => {
				console.error("Error fetching data: ", error)
			})
	}

	return (
		<div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
			<ConnectWalletButton
				userAddress={userAddress}
				setUserAddress={setUserAddress}
				style={{ marginBottom: "10px" }}
			/>
			<input
				type="file"
				onChange={uploadImageHandler}
				style={{ display: "block", marginBottom: "10px" }}
			/>
			<button
				onClick={mintNFT}
				style={{
					marginRight: "10px",
					padding: "5px 15px",
					backgroundColor: "#4CAF50",
					color: "white",
					border: "none",
					cursor: "pointer",
				}}>
				Mint NFT
			</button>
			<button
				onClick={getNFTS}
				disabled={isButtonDisabled}
				style={{
					padding: "5px 15px",
					backgroundColor: "#008CBA",
					color: "white",
					border: "none",
					cursor: "pointer",
				}}>
				Get All NFTs API
			</button>
			<form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
				<label htmlFor="imgName" style={{ marginRight: "10px" }}>
					NFT name:
				</label>
				<input
					type="text"
					id="imgName"
					name="imgName"
					value={imgName}
					onChange={(e) => setImgName(e.target.value)}
					style={{
						marginBottom: "10px",
						marginRight: "10px",
						padding: "5px",
					}}></input>
				<label htmlFor="symbol" style={{ marginRight: "10px" }}>
					NFT Symbol:
				</label>
				<input
					type="text"
					id="symbol"
					name="symbol"
					value={symbol}
					onChange={(e) => setSymbol(e.target.value)}
					style={{ marginBottom: "10px", padding: "5px" }}></input>
			</form>
		</div>
	)
}

export default ImageUploadButton
