interface ConnectionInfoProps {
  address: string;
  chainName?: string;
}

export function ConnectionInfo({ address, chainName }: ConnectionInfoProps) {
  return (
    <div className="bg-base-200 rounded-lg p-4 my-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Wallet on Network:</span>
          <code className="bg-base-300 px-2 py-1 rounded text-sm">{chainName}</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Wallet Address:</span>
          <code className="bg-base-300 px-2 py-1 rounded text-sm">{address}</code>
        </div>
      </div>
    </div>
  );
}
