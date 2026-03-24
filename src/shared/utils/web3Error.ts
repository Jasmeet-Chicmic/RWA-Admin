type ErrorLike = {
  code?: number | string;
  reason?: string;
  message?: string;
  shortMessage?: string;
  data?: {
    message?: string;
  };
  cause?: unknown;
};

const FALLBACK_MESSAGE = "Transaction failed. Please try again.";
const NETWORK_MESSAGE = "Network issue. Please check your connection.";
const USER_CANCELLED_MESSAGE = "Transaction cancelled by user";

const toErrorLike = (value: unknown): ErrorLike | null => {
  if (!value || typeof value !== "object") return null;
  return value as ErrorLike;
};

const cleanRevertMessage = (message: string): string => {
  if (!message) return "";

  const cleaned = message
    .replace(/execution reverted:\s*/gi, "")
    .replace(/VM Exception while processing transaction:\s*/gi, "")
    .trim();

  return cleaned.split("\n")[0]?.trim() || cleaned;
};

const includesNetworkError = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("network") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("timeout")
  );
};

const extractMessageCandidates = (errorLike: ErrorLike): string[] => {
  const candidates: Array<string | undefined> = [
    errorLike.shortMessage,
    errorLike.reason,
    errorLike.data?.message,
    errorLike.message,
  ];

  const nestedCause = toErrorLike(errorLike.cause);
  if (nestedCause) {
    candidates.push(...extractMessageCandidates(nestedCause));
  }

  return candidates.filter((msg): msg is string => Boolean(msg && msg.trim()));
};

export const handleWeb3Error = (error: unknown): string => {
  const errorLike = toErrorLike(error);
  if (!errorLike) return FALLBACK_MESSAGE;

  // EIP-1193 user rejection (MetaMask, WalletConnect, etc.)
  if (errorLike.code === 4001 || errorLike.code === "4001") {
    return USER_CANCELLED_MESSAGE;
  }

  const messages = extractMessageCandidates(errorLike);
  const rejectionMessage = messages.find((msg) =>
    /user denied|user rejected|rejected the request/i.test(msg),
  );
  if (rejectionMessage) {
    return USER_CANCELLED_MESSAGE;
  }

  const networkMessage = messages.find((msg) => includesNetworkError(msg));
  if (networkMessage) {
    return NETWORK_MESSAGE;
  }

  // Prefer Viem/Wagmi short message, then reason/data.message/message.
  const preferredMessage = messages[0];
  if (preferredMessage) {
    const cleaned = cleanRevertMessage(preferredMessage);
    return cleaned || FALLBACK_MESSAGE;
  }

  return FALLBACK_MESSAGE;
};
