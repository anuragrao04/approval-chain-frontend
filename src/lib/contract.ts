import { ethers } from "ethers";
import contractABI from "./abi.json"; // Your ABI (with getRole added)

const CONTRACT_ADDRESS = "0xe98a02C8acC482090a8649BfEAEA0997bFDe2679"; // updated after redeploy

export async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask not found");

  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
}
