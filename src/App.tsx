import { useState } from "react";
import { getCircleAdapter } from "./circleAdapter";
import "./App.css";

const ARC_CHAIN_ID = "0x4ce8d2";
const ARC_CHAIN_ID_DECIMAL = 5042002;
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

      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ARC_CHAIN_ID }],
        });
      } catch (error) {
        const rpcError = error as { code?: number };

        if (rpcError.code === 4902) {
          throw new Error(
            "Arc Testnet is not added to Rabby. Add it manually first.",
          );
        }

        throw error;
      }

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
        throw new Error("Arc Testnet is not supported by the Circle adapter");
      }

      const walletAddress = await adapter.getAddress(chain);
      const client = await adapter.getPublicClient(chain);

      const rawBalance = await client.readContract({
        address: USDC_ADDRESS,
        abi: [
          {
            name: "balanceOf",
            type: "function",
            stateMutability: "view",
            inputs: [{ name: "account", type: "address" }],
            outputs: [{ name: "balance", type: "uint256" }],
          },
        ],
        functionName: "balanceOf",
        args: [walletAddress as `0x${string}`],
      });

      setAddress(walletAddress);
      setBalance(
        (Number(rawBalance) / 1_000_000).toLocaleString("en-US", {
          maximumFractionDigits: 6,
        }),
      );

      setStatus("Connected to Arc Testnet");
    } catch (error) {
      console.error(error);
      setStatus(
        error instanceof Error ? error.message : "Connection failed",
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
            <div className="connected">● Wallet Connected</div>

            <div className="label">Address</div>
            <div className="address">{address}</div>

            <div className="balance-box">
              <span>USDC Balance</span>
              <strong>{balance} USDC</strong>
            </div>
          </div>
        )}

        {status && <p className="status">{status}</p>}
      </section>
    </main>
  );
}

export default App;
