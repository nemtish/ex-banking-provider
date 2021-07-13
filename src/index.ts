import { IExBanking } from "./interface";
import { Ok, BankingError } from "./types";
import { roundAmountWithDecimal } from "./util/number.helper";
import {
    validateUsername,
    validateWalletAction,
} from "./util/validation.helper";
import * as userService from "./util/user.service";
import * as walletService from "./util/wallet.service";

export default class ExBankingProvider implements IExBanking {
    createUser(username: string): Ok | BankingError {
        try {
            validateUsername(username);
            const user = userService.create(username);
            walletService.createWallet(user);
        } catch (e) {
            return {
                success: false,
                message: e.message,
            };
        }

        return { success: true };
    }

    deposit(
        username: string,
        amount: number,
        currency: string
    ): (Ok & { newBalance: number }) | BankingError {
        try {
            validateWalletAction(username, amount, currency);

            const user = userService.findByUsername(username);
            const wallet = walletService.deposit(user, amount, currency.toUpperCase());

            return {
                success: true,
                newBalance: roundAmountWithDecimal(wallet.balance, 2),
            };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    withdraw(
        username: string,
        amount: number,
        currency: string
    ): (Ok & { newBalance: number }) | BankingError {
        try {
            validateWalletAction(username, amount, currency);

            const user = userService.findByUsername(username);
            const currencyWallet = walletService.withdraw(user, amount, currency.toUpperCase());

            return {
                success: true,
                newBalance: roundAmountWithDecimal(currencyWallet.balance, 2),
            };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    getBalance(
        username: string,
        currency: string
    ): (Ok & { balance: number }) | BankingError {
        try {
            const user = userService.findByUsername(username);
            const currencyWallet = walletService.getOrCreateCurrencyWallet(
                user,
                currency.toUpperCase()
            );

            return {
                success: true,
                balance: roundAmountWithDecimal(currencyWallet.balance, 2),
            };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    send(
        fromUsername: string,
        toUsername: string,
        amount: number,
        currency: string
    ):
        | (Ok & { fromUsernameBalance: number; toUsernameBalance: number })
        | BankingError {

        try {
            validateWalletAction(fromUsername, amount, currency);
            validateUsername(toUsername);

            const newBalances = walletService.transaction(fromUsername, toUsername, amount, currency.toUpperCase());

            return { success: true, ...newBalances };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }
}
