import { User, Wallet } from "../interface";

export let users: User[] = [];
export let wallets: Record<string, Wallet> = {};

export const truncate = () => {
    users = [];
    wallets = {};
};

