import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useWriteContract } from "wagmi";

export function ProposalList() {
  const [proposals, setProposals] = useState<Array<{ name: string; voteCount: string }>>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voteAmounts, setVoteAmounts] = useState<{ [key: number]: string }>({});
  const [votingStatus, setVotingStatus] = useState<string | null>(null);

  const { writeContract, isPending } = useWriteContract();

  const refreshData = () => {
    // Refresh proposals
    fetch("http://localhost:3001/ballot/proposals")
      .then(res => res.json())
      .then(data => {
        setProposals(data);
      })
      .catch(err => console.error("Error refreshing proposals:", err));

    // Refresh winner
    fetch("http://localhost:3001/ballot/winner")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWinner(data.map(w => w.name).join(" & "));
        } else {
          setWinner(data.name);
        }
      })
      .catch(err => console.error("Error refreshing winner:", err));
  };

  useEffect(() => {
    refreshData();
    setLoading(false);
  }, []);

  const handleVote = async () => {
    const votesToSubmit = Object.entries(voteAmounts)
      .filter(([_, amount]) => amount !== "" && parseFloat(amount) > 0)
      .map(([proposalId, amount]) => ({
        proposalId: parseInt(proposalId),
        amount: parseFloat(amount),
      }))[0];

    if (!votesToSubmit) {
      setVotingStatus("Please enter vote amounts");
      return;
    }

    try {
      setVotingStatus("Voting...");

      const response = await fetch("http://localhost:3001/ballot-address");
      const { result: ballotAddress } = await response.json();

      await writeContract({
        address: ballotAddress,
        abi: [
          {
            inputs: [
              { name: "proposal", type: "uint256" },
              { name: "amount", type: "uint256" },
            ],
            name: "vote",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "vote",
        args: [BigInt(votesToSubmit.proposalId), parseEther(votesToSubmit.amount.toString())],
      });

      setVotingStatus("Vote submitted successfully!");
      setVoteAmounts({});
      refreshData();
    } catch (err) {
      console.error("Voting error:", err);
      setVotingStatus("Error voting");
    }
  };

  if (isLoading) return <div>Loading proposals...</div>;
  if (error) return <div>Error loading proposals: {error}</div>;

  return (
    <div className="card w-full max-w-4xl bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Proposals</h2>
        {winner && (
          <div className="bg-success text-success-content p-2 rounded-lg mb-4">
            {winner.includes(" & ") ? "Current Winners: " : "Current Winner: "}
            {winner}
          </div>
        )}
        {Array.isArray(proposals) && proposals.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="table bg-base-200 rounded-lg">
                <thead>
                  <tr className="text-primary-content">
                    <th className="text-center">ID</th>
                    <th>Proposal</th>
                    <th className="text-right">Votes</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((proposal, index) => (
                    <tr key={index} className="hover:bg-base-300">
                      <td className="text-center">{index + 1}</td>
                      <td>{proposal.name}</td>
                      <td className="text-right font-mono">
                        {parseFloat(formatEther(BigInt(proposal.voteCount))).toFixed(2)} ETH
                      </td>
                      <td className="text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="0"
                          className="input input-bordered w-24 text-primary"
                          value={voteAmounts[index] || ""}
                          onChange={e => setVoteAmounts({ ...voteAmounts, [index]: e.target.value })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col items-center">
              {votingStatus && <div className="text-sm mb-2">{votingStatus}</div>}
              <button className="btn btn-secondary" onClick={handleVote} disabled={isPending}>
                {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Submit Votes"}
              </button>
            </div>
          </div>
        ) : (
          <div>No proposals available</div>
        )}
      </div>
    </div>
  );
}
