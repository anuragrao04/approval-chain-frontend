import { ethers } from "ethers";
import approvalContractABI from "./approval-abi.json";
import budgetContractABI from "./budget-abi.json";
const APPROVAL_CONTRACT_ADDRESS = "0x8bEd325124B0e9Cb6BD2F423855a1A1B56534667"; // updated after redeploy
const BUDGET_CONTRACT_ADDRESS = "0x94e55a1085B1164941AC34Aa419Da71e55dD371d";

export async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask not found");

  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return [
    new ethers.Contract(APPROVAL_CONTRACT_ADDRESS, approvalContractABI, signer),
    new ethers.Contract(BUDGET_CONTRACT_ADDRESS, budgetContractABI, signer),
  ];
}
