"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useMemo } from "react";

type PrivyState = ReturnType<typeof usePrivy>;

export type XBytePrivyState = Pick<
    PrivyState,
    | "authenticated"
    | "user"
    | "logout"
    | "sendTransaction"
    | "connectOrCreateWallet"
    | "login"
    | "ready"
> & {
    walletAddress: `0x${string}` | undefined;
    email: string | undefined;
};

export function useXBytePrivy(): XBytePrivyState {
    const { authenticated, user, logout, sendTransaction, connectOrCreateWallet, login, ready } =
        usePrivy();

    const walletAddress = useMemo(
        () => user?.wallet?.address as `0x${string}` | undefined,
        [user?.wallet?.address],
    );

    const email = useMemo(() => user?.email?.address, [user?.email?.address]);

    return {
        authenticated,
        user,
        walletAddress,
        email,
        logout,
        sendTransaction,
        connectOrCreateWallet,
        login,
        ready,
    };
}
