import { useState } from "react";
import { parseEther } from "viem";
import { useWriteContract } from "wagmi";

interface MintTokensProps {
  address: string;
}

export function MintTokens({ address }: MintTokensProps) {
  const { writeContract, isPending } = useWriteContract();
  const [txStatus, setTxStatus] = useState<string>("");
  const [mintAmount, setMintAmount] = useState<string>("");

  const handleMintRequest = async () => {
    if (!mintAmount || isNaN(Number(mintAmount))) {
      setTxStatus("Please enter a valid amount");
      return;
    }

    try {
      setTxStatus("Requesting tokens...");

      // Get token contract address
      const response = await fetch("http://localhost:3001/contract-address");
      const { result: tokenAddress } = await response.json();

      await writeContract({
        address: tokenAddress,
        abi: [
          {
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            name: "mint",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "mint",
        args: [address, parseEther(mintAmount)],
      });

      setTxStatus("Transaction submitted successfully");
    } catch (err) {
      console.error("Minting error:", err);
      setTxStatus("Error minting tokens");
    }
  };

  return (
    <div className="card w-full max-w-4xl bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Minting Tokens</h2>
        <h4>Must have the role of minter to mint tokens</h4>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              step="0.1"
              placeholder="Amount in ETH"
              className="input input-bordered w-1/2 text-primary"
              value={mintAmount}
              onChange={e => setMintAmount(e.target.value)}
            />
            <button
              className="btn btn-active btn-neutral"
              onClick={handleMintRequest}
              disabled={isPending || !mintAmount}
            >
              {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Mint tokens"}
            </button>
          </div>
          {txStatus && <p>{txStatus}</p>}
        </div>
      </div>
    </div>
  );
}
