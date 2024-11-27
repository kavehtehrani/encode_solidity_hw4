import { useEffect, useState } from "react";

type TokenInfoData = {
  contractAddress: string;
  tokenName: string;
  totalSupply: string;
};

interface TokenInfoProps {
  address: string;
}

export const TokenInfo: React.FC<TokenInfoProps> = ({ address }) => {
  const [tokenInfo, setTokenInfo] = useState<TokenInfoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        const [addressRes, nameRes, supplyRes] = await Promise.all([
          fetch("http://localhost:3001/contract-address"),
          fetch("http://localhost:3001/token-name"),
          fetch("http://localhost:3001/total-supply"),
        ]);

        const [addressData, nameData, supplyData] = await Promise.all([
          addressRes.json(),
          nameRes.json(),
          supplyRes.json(),
        ]);

        setTokenInfo({
          contractAddress: addressData.result,
          tokenName: nameData.result,
          totalSupply: supplyData.result,
        });
      } catch (err) {
        setError("Failed to fetch token information");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenInfo();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse">Loading token information...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-base-200 p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Token Information</h2>
      <div className="space-y-2">
        <div>
          <span className="font-semibold">Token Name:</span>
          <code className="bg-base-300 px-2 py-1 rounded text-sm">{tokenInfo?.tokenName}</code>
        </div>
        <div>
          <span className="font-semibold">Contract Address:</span>{" "}
          <code className="bg-base-300 px-2 py-1 rounded text-sm">{tokenInfo?.contractAddress}</code>
        </div>
        <div>
          <span className="font-semibold">Total Supply:</span>{" "}
          <code className="bg-base-300 px-2 py-1 rounded text-sm">{tokenInfo?.totalSupply}</code>
        </div>
      </div>
    </div>
  );
};
