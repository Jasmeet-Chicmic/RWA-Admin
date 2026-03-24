import { PublicClient, WalletClient } from "viem";
import { resumeTokenizationFlow } from "./tokenization/resumeTokenizationFlow";
import {
  TOKENIZATION_FLOW_STEPS,
  type RunTokenizationFlowInput,
  type TokenizationFlowStep,
} from "./tokenization/types";

type RunTokenizationFlowParams = {
  walletClient: WalletClient;
  publicClient: PublicClient;
  input: RunTokenizationFlowInput;
  onStepChange?: (step: TokenizationFlowStep) => void;
};

export { TOKENIZATION_FLOW_STEPS };
export type { RunTokenizationFlowInput, TokenizationFlowStep };

export const runTokenizationFlow = async ({
  walletClient,
  publicClient,
  input,
  onStepChange,
}: RunTokenizationFlowParams) =>
  resumeTokenizationFlow({
    walletClient,
    publicClient,
    input,
    onStepChange,
  });
