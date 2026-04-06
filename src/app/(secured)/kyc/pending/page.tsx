import { ROUTES } from "@/shared/routes";
import { redirect } from "next/navigation";

/**
 * Legacy URL: all verification requests are listed under /kyc/verification.
 */
export default function KycPendingRedirectPage() {
  redirect(ROUTES.KYC_VERIFICATION);
}
