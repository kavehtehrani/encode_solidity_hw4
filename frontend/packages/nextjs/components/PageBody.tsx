import { useAccount } from "wagmi";
import { BallotAddressFromApi } from "~~/components/BallotAddressFromApi";
import { ConnectionInfo } from "~~/components/ConnectionInfo";
import { MintTokens } from "~~/components/MintTokens";
import { ProposalList } from "~~/components/ProposalList";
import { TokenAddressFromApi } from "~~/components/TokenAddressFromApi";
import { TokenInfo } from "~~/components/TokenInfo";
import { VotingPower } from "~~/components/VotingPower";

export function PageBody() {
  const { address, isConnecting, isDisconnected, chain } = useAccount();

  if (address)
    return (
      <div>
        <ConnectionInfo address={address} chainName={chain?.name} />
        <hr></hr>
        <BallotAddressFromApi></BallotAddressFromApi>
        <ProposalList></ProposalList>
        <VotingPower address={address as `0x${string}`}></VotingPower>
        <hr className="mt-12"></hr>
        <TokenAddressFromApi>
          {(tokenAddress: string) => <TokenInfo address={tokenAddress}></TokenInfo>}
        </TokenAddressFromApi>
        <MintTokens address={address as `0x${string}`}></MintTokens>
      </div>
    );
  if (isConnecting)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isDisconnected)
    return (
      <div>
        <p>Wallet disconnected. Connect wallet to continue</p>
      </div>
    );
  return (
    <div>
      <p>Connect wallet to continue</p>
    </div>
  );
}
