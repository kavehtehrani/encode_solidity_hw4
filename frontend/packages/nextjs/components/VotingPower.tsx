import { useEffect, useState } from "react";
import { formatEther } from "viem";

interface Vote {
  proposalName: string;
  proposalId: number;
  voteCount: string;
}

interface VotingHistoryData {
  voter: string;
  votePowerSpent: string;
  remainingVotePower: string;
  votes: Vote[];
}

interface VotingPowerProps {
  address: `0x${string}`;
}

export function VotingPower({ address }: VotingPowerProps) {
  const [totalPower, setTotalPower] = useState<string>();
  const [votingHistory, setVotingHistory] = useState<VotingHistoryData>();
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch total voting power
    fetch(`http://localhost:3001/ballot/voting-power/${address}`)
      .then(res => res.json())
      .then(data => {
        setTotalPower(data.result);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching voting power:", err);
        setError(err.message);
        setLoading(false);
      });

    // Fetch voting history separately
    fetch(`http://localhost:3001/ballot/voting-history/${address}`)
      .then(res => res.json())
      .then(data => {
        setVotingHistory(data);
      })
      .catch(err => {
        console.error("Error fetching voting history:", err);
      });
  }, [address]);

  if (isLoading) return <div>Loading voting power...</div>;
  if (error) return <div>Error loading voting power: {error}</div>;
  if (!totalPower) return <div>No voting power data available</div>;

  return (
    <div className="card w-full max-w-4xl bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Your Voting Power</h2>
        <div className="stats bg-base-200 text-primary-content">
          <div className="stat">
            <div className="stat-title">Total Voting Power</div>
            <div className="stat-value text-lg">{parseFloat(formatEther(BigInt(totalPower))).toFixed(2)} ETH</div>
          </div>
          {votingHistory && (
            <>
              <div className="stat">
                <div className="stat-title">Power Spent</div>
                <div className="stat-value text-lg">
                  {parseFloat(formatEther(BigInt(votingHistory.votePowerSpent))).toFixed(2)} ETH
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Remaining Power</div>
                <div className="stat-value text-lg">
                  {parseFloat(formatEther(BigInt(votingHistory.remainingVotePower))).toFixed(2)} ETH
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Voting History</h3>
          {votingHistory && votingHistory.votes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table bg-base-200 rounded-lg">
                <thead>
                  <tr className="text-primary-content text-lg">
                    <th>Proposal</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {votingHistory.votes.map((vote, index) => (
                    <tr key={vote.proposalId} className="hover:bg-base-300">
                      <td>{vote.proposalName}</td>
                      <td className="text-right font-mono">
                        {parseFloat(formatEther(BigInt(vote.voteCount))).toFixed(2)} ETH
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>No voting history available</div>
          )}
        </div>
      </div>
    </div>
  );
}
