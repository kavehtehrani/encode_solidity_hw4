import { useEffect, useState } from "react";

export function BallotAddressFromApi() {
  const [data, setData] = useState<{ result: string }>();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/ballot-address")
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading ballot address...</p>;
  if (!data) return <p>No ballot address available</p>;

  return (
    <div className="bg-base-200 rounded-lg p-4 my-2">
      <div className="flex items-center gap-2">
        <span className="font-semibold">Ballot Contract:</span>
        <code className="bg-base-300 px-2 py-1 rounded text-sm">{data.result}</code>
      </div>
    </div>
  );
}
