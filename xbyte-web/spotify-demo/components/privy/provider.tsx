"use client";

import { PrivyProvider } from "@privy-io/react-auth";

const PRIVY_APP_ID = "cmigyzusl00qhl20cl7qtnczl";
const PRIVY_CLIENT_ID = "client-WY6TMNBR45a7ie2SwSpVPK8vHJFEsGvHnPf7Ph2n4LBnN";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      clientId={PRIVY_CLIENT_ID}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
