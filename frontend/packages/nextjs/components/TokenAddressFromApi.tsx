import { useEffect, useState } from "react";

interface TokenAddressFromApiProps {
  children: (address: string) => React.ReactNode;
}

export function TokenAddressFromApi({ children }: TokenAddressFromApiProps) {
  const [data, setData] = useState<{ result: string }>();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/contract-address")
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading token address from API...</p>;
  if (!data) return <p>No token address information</p>;

  return (
    <>
      <div className="bg-base-200 rounded-lg p-4 my-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Token Contract:</span>
          <code className="bg-base-300 px-2 py-1 rounded text-sm">{data.result}</code>
        </div>
      </div>
      {children(data.result)}
    </>
  );
}
