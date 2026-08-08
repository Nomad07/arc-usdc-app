import { useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
} from "viem";
import "./App.css";

const ARC_CHAIN_ID = 5044050;
const ARC_CHAIN_ID_HEX = "0x4cef52" as const;
const ARC_RPC = "https://rpc.testnet.arc.network";

const arcTestnet = {
  id: ARC_CHAIN_ID,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [ARC_RPC],
    },
  },
} as const;

type EthereumProvider = {
  request: (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
};

function App() {
  const [address, setAddress] = useState<Address | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");

  async function connectWallet() {
    setError("");
    setStatus("Connecting...");

    try {
      const ethereum = (window as Window & {
        ethereum?: EthereumProvider;
      }).ethereum;

      if (!ethereum) {
        throw new Error("Rabby wallet was not found.");
      }

      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts.length) {
        throw new Error("No wallet account returned.");
      }

      let currentChainId = (await ethereum.request({
        method: "eth_chainId",
      })) as string;

      if (currentChainId !== ARC_CHAIN_ID_HEX) {
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ARC_CHAIN_ID_HEX }],
          });
        } catch (switchError: unknown) {
          const code =
            typeof switchError === "object" &&
            switchError !== null &&
            "code" in switchError
              ? (switchError as { code?: number }).code
              : undefined;

          if (code === 4902 || code === -32603) {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: ARC_CHAIN_ID_HEX,
                  chainName: "Arc Testnet",
                  nativeCurrency: {
                    name: "USDC",
                    symbol: "USDC",
                    decimals: 18,
                  },
                  rpcUrls: [ARC_RPC],
                  blockExplorerUrls: ["https://testnet.arcscan.app"],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }

        currentChainId = (await ethereum.request({
          method: "eth_chainId",
        })) as string;
      }

      if (currentChainId !== ARC_CHAIN_ID_HEX) {
        throw new Error(
          `Wrong network. Rabby returned ${currentChainId} instead of ${ARC_CHAIN_ID_HEX}.`,
        );
      }

      const walletClient = createWalletClient({
        chain: arcTestnet,
        transport: custom(ethereum),
      });

      const walletAddresses = await walletClient.getAddresses();

      if (!walletAddresses.length) {
        throw new Error("Rabby did not return an address.");
      }

      const publicClient = createPublicClient({
        chain: arcTestnet,
        transport: http(ARC_RPC),
      });

      const blockNumber = await publicClient.getBlockNumber();

      setAddress(walletAddresses[0]);
      setChainId(currentChainId);
      setStatus(`Connected. Arc block ${blockNumber.toString()}`);
    } catch (err) {
      console.error(err);
      setStatus("Connection failed");
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function disconnectWallet() {
    setAddress(null);
    setChainId(null);
    setStatus("Disconnected");
    setError("");
  }

  return (
    <main>
      <div className="app">
        <h1>ARC USDC APP</h1>

        <h2>USDC on Arc Testnet</h2>

        <p className="description">
          Connect Rabby to view your USDC balance on Arc Testnet.
        </p>

        {!address ? (
          <button type="button" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <button type="button" onClick={disconnectWallet}>
            Disconnect
          </button>
        )}

        <p>{status}</p>

        {address && (
          <div>
            <p>
              <strong>Wallet:</strong>{" "}
              <code>
                {address.slice(0, 6)}...{address.slice(-4)}
              </code>
            </p>

            <p>
              <strong>Chain ID:</strong> <code>{chainId}</code>
            </p>
          </div>
        )}

        {error && <p>{error}</p>}
      </div>
    </main>
  );
}

export default App;
