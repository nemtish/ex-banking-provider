import { v4 } from "uuid";
import { User, Wallet, CurrencyWallet } from "../interface";
import * as db from "../persistence";
import { TransactionBalance, ErrorMessage } from "../types";
import { findByUsername } from "./user.service";

export const createWallet = (user: User): Wallet => {
    if (getWallet(user)) {
        throw new Error(ErrorMessage.WALLET_ALREADY_EXISTS);
    }

    const userWallet = (db.wallets[user.username] = {});
    return userWallet;
};

export const getWallet = (user: User): Wallet | null => {
    return db.wallets[user.username];
};

export const getOrCreateCurrencyWallet = (
    user: User,
    currency: string
): CurrencyWallet => {
    let userWallet = getWallet(user);

    if (!userWallet) {
        userWallet = createWallet(user);
    }

    if (!userWallet[currency]) {
        userWallet[currency] = { id: v4(), name: currency, balance: 0 };
    }

    return userWallet[currency];
};

export const deposit = (
    user: User,
    amount: number,
    currency: string
): CurrencyWallet => {
    const currencyWallet = getOrCreateCurrencyWallet(user, currency);
    currencyWallet.balance += amount;
    return currencyWallet;
};

export const withdraw = (
    user: User,
    amount: number,
    currency: string
): CurrencyWallet => {
    const currencyWallet = getOrCreateCurrencyWallet(user, currency);

    if (currencyWallet.balance - amount < 0) {
        throw new Error(ErrorMessage.NOT_ENOUGH_MONEY);
    }

    currencyWallet.balance -= amount;
    return currencyWallet;
};

export const transaction = (
    fromUsername: string,
    toUsername: string,
    amount: number,
    currency: string
): TransactionBalance => {
    let fromUser: User, toUser: User;

    try {
        fromUser = findByUsername(fromUsername);
    } catch(e) {
        throw new Error(ErrorMessage.SENDER_DOES_NOT_EXIST);
    }

    try {
        toUser = findByUsername(toUsername);
    } catch(e) {
        throw new Error(ErrorMessage.RECEIVER_DOES_NOT_EXIST);
    }

    const senderCurrencyWallet = withdraw(fromUser, amount, currency);
    const receiverCurrencyWallet = deposit(toUser, amount, currency);

    return {
        fromUsernameBalance: senderCurrencyWallet.balance,
        toUsernameBalance: receiverCurrencyWallet.balance
    }
};
