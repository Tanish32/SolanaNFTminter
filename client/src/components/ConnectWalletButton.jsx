import React from "react"

function ConnectWalletButton({ userAddress, setUserAddress }) {
	const connectWalletHandler = async () => {
		if (window.solana && window.solana.isPhantom) {
			try {
				const response = await window.solana.connect({ onlyIfTrusted: false })
				setUserAddress(response.publicKey.toString())
			} catch (error) {
				console.error(error)
			}
		} else {
			alert("Please install Phantom!")
		}
	}

	return (
		<button onClick={connectWalletHandler}>
			{userAddress ? `Wallet Connected: ${userAddress}` : "Connect Wallet"}
		</button>
	)
}

export default ConnectWalletButton
