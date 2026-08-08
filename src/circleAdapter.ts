import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import type { EIP1193Provider } from "viem";

export async function getCircleAdapter() {
  const provider = (window as Window & {
    ethereum?: EIP1193Provider;
  }).ethereum;

  if (!provider) {
    throw new Error("Rabby provider not found");
  }

  return createViemAdapterFromProvider({
    provider,
  });
}
