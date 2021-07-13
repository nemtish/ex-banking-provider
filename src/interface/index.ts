import { Ok, BankingError } from "../types";

export interface IExBanking {

  createUser(username: string): Ok | BankingError;

  deposit(
    username: string,
    amount: number,
    currency: string
  ): (Ok & { newBalance: number }) | BankingError;

  withdraw(
    username: string,
    amount: number,
    currency: string
  ): (Ok & { newBalance: number }) | BankingError;

  getBalance(
    username: string,
    currency: string
  ): (Ok & { balance: number }) | BankingError;

  send(
    fromUsername: string,
    toUsername: string,
    amount: number,
    currency: string
  ):
    | (Ok & { fromUsernameBalance: number; toUsernameBalance: number })
    | BankingError;
}

export interface User {
    id:  string,
    username: string
}

export interface Wallet {
    [currency: string]: CurrencyWallet
}

export interface CurrencyWallet {
    id: string,
    balance: number,
    name: string,
    code?: string
}

