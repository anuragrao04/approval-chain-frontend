"use client";

import { useEffect, useState } from "react";
import { getContract } from "./contract";

export function useRole(address: string | null) {
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    if (!address) {
      setRole("Not connected");
      return;
    }

    async function fetchRole() {
      try {
        const [approvalContract, budgetContract] = await getContract();
        const r = await approvalContract.getRole(address);
        setRole(r);
      } catch (err) {
        console.error("Error getting role:", err);
        setRole("Unknown");
      }
    }

    fetchRole();
  }, [address]);

  return role;
}
