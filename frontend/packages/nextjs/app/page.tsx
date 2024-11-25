"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BallotAddressFromApi } from "~~/components/BallotAddressFromApi";
import { ConnectionInfo } from "~~/components/ConnectionInfo";
import { MintTokens } from "~~/components/MintTokens";
import { ProposalList } from "~~/components/ProposalList";
import { TokenAddressFromApi } from "~~/components/TokenAddressFromApi";
import { TokenInfo } from "~~/components/TokenInfo";
import { VotingPower } from "~~/components/VotingPower";

const Home: NextPage = () => {
  const { address, isConnecting, isDisconnected, chain } = useAccount();

  const renderContent = () => {
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
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-4xl mb-2">Tokenized Ballot</span>
          </h1>
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default Home;
