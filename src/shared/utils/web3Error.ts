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
const USER_CANCELLED_MESSAGE = "User rejected the request";

const DEFAULT_INVALID_WALLET_SIGNATURE_MESSAGE =
  "This wallet doesn't match your account. Connect the wallet linked to your profile, then sign in again.";

export type HandleWeb3ErrorOptions = {
  /** Shown when the API reports an invalid wallet signature (wrong wallet for this account). */
  invalidWalletSignatureMessage?: string;
  /** Shown when there is no usable error message (e.g. empty API message). */
  genericFailureMessage?: string;
};

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

const isInvalidWalletSignatureMessage = (message: string): boolean => {
  const normalized = message.trim().toLowerCase().replace(/\.+$/, "");
  return (
    normalized === "invalid wallet signature" ||
    normalized.includes("invalid wallet signature") ||
    normalized.includes("signature does not match") ||
    normalized.includes("signature mismatch")
  );
};

const extractPlainMessage = (error: unknown): string | null => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return null;
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

/** True when the error indicates the signed message did not verify for this account (wrong wallet / bad signature). */
export const isInvalidWalletSignatureError = (error: unknown): boolean => {
  const plain = extractPlainMessage(error);
  if (plain !== null) {
    const trimmed = plain.trim();
    if (trimmed && isInvalidWalletSignatureMessage(trimmed)) {
      return true;
    }
  }

  const errorLike = toErrorLike(error);
  if (!errorLike) return false;
  const messages = extractMessageCandidates(errorLike);
  return messages.some((msg) => isInvalidWalletSignatureMessage(msg));
};

export const handleWeb3Error = (
  error: unknown,
  options?: HandleWeb3ErrorOptions,
): string => {
  const generic = options?.genericFailureMessage ?? FALLBACK_MESSAGE;
  const wrongWallet =
    options?.invalidWalletSignatureMessage ??
    DEFAULT_INVALID_WALLET_SIGNATURE_MESSAGE;

  const plain = extractPlainMessage(error);
  if (plain !== null) {
    const trimmed = plain.trim();
    if (!trimmed) return generic;
    if (isInvalidWalletSignatureMessage(trimmed)) {
      return wrongWallet;
    }
    if (/user denied|user rejected|rejected the request/i.test(trimmed)) {
      return USER_CANCELLED_MESSAGE;
    }
    if (includesNetworkError(trimmed)) {
      return NETWORK_MESSAGE;
    }
    return trimmed;
  }

  const errorLike = toErrorLike(error);
  if (!errorLike) return generic;

  // EIP-1193 user rejection (MetaMask, WalletConnect, etc.)
  if (errorLike.code === 4001 || errorLike.code === "4001") {
    return USER_CANCELLED_MESSAGE;
  }

  const messages = extractMessageCandidates(errorLike);
  const invalidSig = messages.find((msg) =>
    isInvalidWalletSignatureMessage(msg),
  );
  if (invalidSig) {
    return wrongWallet;
  }

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
    return cleaned || generic;
  }

  return generic;
};
