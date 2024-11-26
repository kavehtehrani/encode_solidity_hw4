import { useEffect, useState } from "react";
import { formatEther } from "viem";

interface Vote {
  id: number;
  voter: string;
  proposalId: number;
  amount: string;
  transactionHash: string;
  timestamp: string;
}

export const RecentVotes = () => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await fetch("http://localhost:3001/ballot/recent-votes");
        if (!response.ok) {
          throw new Error("Failed to fetch votes");
        }
        const data = await response.json();
        const sortedVotes = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setVotes(sortedVotes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch votes");
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, []);

  if (loading) return <div>Loading recent votes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Recent Votes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2">Voter</th>
              <th className="px-4 py-2">Proposal ID</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {votes.map(vote => (
              <tr key={vote.id} className="border-t border-gray-200 dark:border-gray-600">
                <td className="px-4 py-2 text-sm">
                  {vote.voter.slice(0, 6)}...{vote.voter.slice(-4)}
                </td>
                <td className="px-4 py-2 text-center">{vote.proposalId}</td>
                <td className="px-4 py-2 text-right">{formatEther(BigInt(vote.amount))} ETH</td>
                <td className="px-4 py-2 text-sm">{new Date(vote.timestamp).toLocaleString()}</td>
                <td className="px-4 py-2 text-sm">
                  <a
                    href={`https://sepolia.etherscan.io/tx/${vote.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 underline"
                  >
                    {vote.transactionHash.slice(0, 6)}...
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
