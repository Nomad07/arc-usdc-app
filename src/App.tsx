import { useState } from "react";
import { getCircleAdapter } from "./circleAdapter";
import "./App.css";

const ARC_CHAIN_ID = "0x4cef52";
const ARC_CHAIN_ID_DECIMAL = 5044050;

const ARC_CHAIN = {
  chainId: ARC_CHAIN_ID,
  chainName: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.testnet.arc.network"],
  blockExplorerUrls: ["https://testnet.arcscan.app"],
};

const USDC_ADDRESS =
  "0x3600000000000000000000000000000000000000" as `0x${string}`;

type EthereumProvider = {
  request: (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
};

function App() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function connectWallet() {
    try {
      setLoading(true);
      setStatus("Connecting wallet...");

      const provider = (window as Window & {
        ethereum?: EthereumProvider;
      }).ethereum;

      if (!provider) {
        throw new Error("Rabby wallet was not found");
      }

      await provider.request({
        method: "eth_requestAccounts",
      });

      setStatus("Checking Arc Testnet...");

      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ARC_CHAIN_ID }],
        });
      } catch (error) {
        const rpcError = error as {
          code?: number;
          message?: string;
        };

        const message = rpcError.message?.toLowerCase() ?? "";

        const chainNotFound =
          rpcError.code === 4902 ||
          rpcError.code === -32603 ||
          message.includes("unrecognized chain id") ||
          message.includes("chain not found");

        if (!chainNotFound) {
          throw error;
        }

        setStatus("Adding Arc Testnet to Rabby...");

        await provider.request({
          method: "wallet_addEthereumChain",
          params: [ARC_CHAIN],
        });

        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ARC_CHAIN_ID }],
        });
      }

      const currentChainId = await provider.request({
        method: "eth_chainId",
      });

      if (currentChainId !== ARC_CHAIN_ID) {
        throw new Error(
          `Wrong network. Current chain ID: ${String(currentChainId)}`,
        );
      }

      setStatus("Connecting to Circle adapter...");

      const adapter = await getCircleAdapter();

      if (!adapter.capabilities) {
        throw new Error("Circle adapter capabilities are unavailable");
      }

      const chain = adapter.capabilities.supportedChains.find(
        (item) =>
          item.type === "evm" &&
          "chainId" in item &&
          item.chainId === ARC_CHAIN_ID_DECIMAL,
      );

      if (!chain || chain.type !== "evm") {
        throw new Error(
          "Arc Testnet is not supported by the Circle adapter",
        );
      }

      const walletAddress = await adapter.getAddress(chain);

      const client = await adapter.getPublicClient(chain);

      setStatus("Reading USDC balance...");

      const rawBalance = await client.readContract({
        address: USDC_ADDRESS,
        abi: [
          {
            name: "balanceOf",
            type: "function",
            stateMutability: "view",
            inputs: [
              {
                name: "account",
                type: "address",
              },
            ],
            outputs: [
              {
                name: "balance",
                type: "uint256",
              },
            ],
          },
        ],
        functionName: "balanceOf",
        args: [walletAddress as `0x${string}`],
      });

      const formattedBalance =
        Number(rawBalance) / 1_000_000;

      setAddress(walletAddress);
      setBalance(
        formattedBalance.toLocaleString("en-US", {
          maximumFractionDigits: 6,
        }),
      );

      setStatus("Connected to Arc Testnet");
    } catch (error) {
      console.error("Connection error:", error);

      setStatus(
        error instanceof Error
          ? error.message
          : "Connection failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <section className="card">
        <div className="eyebrow">ARC USDC APP</div>

        <h1>USDC on Arc Testnet</h1>

        <p className="description">
          Connect Rabby to view your USDC balance on Arc Testnet.
        </p>

        {!address ? (
          <button
            className="primary-button"
            onClick={connectWallet}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <div className="wallet-panel">
            <div className="connected">
              ● Wallet Connected
            </div>

            <div className="label">Address</div>

            <div className="address">
              {address}
            </div>

            <div className="balance-box">
              <span>USDC Balance</span>
              <strong>{balance} USDC</strong>
            </div>
          </div>
        )}

        {status && (
          <p className="status">
            {status}
          </p>
        )}
      </section>
    </main>
  );
}

export default App;
