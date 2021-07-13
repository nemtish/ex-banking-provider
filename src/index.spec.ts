import ExBankingProvider from "./index";
import { truncate } from "./persistence";
import { ErrorMessage } from "./types";
import * as userService from "./util/user.service";

describe("ExBanking", () => {
    beforeEach(() => {
        truncate();
    });

    describe("createUser", () => {
        const exBanking = new ExBankingProvider();

        it("should return wrong arguments if username is missing", () => {
            expect(exBanking.createUser("")).toEqual(expect.objectContaining({
                success: false,
                message: ErrorMessage.WRONG_ARGUMENTS,
            }));
        });

        it("should create user and return success message", () => {
            const username = "John";
            expect(exBanking.createUser(username)).toEqual({ success: true });
            expect(userService.findByUsername(username)).toEqual(
                expect.objectContaining({ username })
            );
        });

        it("should not create user if already exist and return false message", () => {
            const username = "Tom";
            exBanking.createUser(username);
            expect(exBanking.createUser(username)).toEqual(
                expect.objectContaining({ success: false })
            );
        });
    });

    describe("deposit", () => {
        const exBanking = new ExBankingProvider();

        it("should return wrong arguments if negative amount, no username or currency provided", () => {
            const username = "John";
            exBanking.createUser(username);
            expect(exBanking.deposit(username, -1, "EUR")).toEqual({
                success: false,
                message: ErrorMessage.WRONG_ARGUMENTS,
            });
            expect(exBanking.deposit("", 10, "EUR")).toEqual({
                success: false,
                message: ErrorMessage.WRONG_ARGUMENTS,
            });
            expect(exBanking.deposit("", 10, "")).toEqual({
                success: false,
                message: ErrorMessage.WRONG_ARGUMENTS,
            });
        });

        it("should return user does not exist if wrong username", () => {
            const username = "Paul";
            expect(exBanking.deposit(username, 10, "EUR")).toEqual({
                success: false,
                message: ErrorMessage.USER_DOES_NOT_EXIST,
            });
        });

        it("should deposit and return success message with correct balance", () => {
            const initialAmount = 10;
            const username = "John";
            exBanking.createUser(username);
            expect(exBanking.deposit(username, initialAmount, "EUR")).toEqual({
                success: true,
                newBalance: initialAmount,
            });
            expect(exBanking.deposit(username, initialAmount, "EUR")).toEqual({
                success: true,
                newBalance: initialAmount * 2,
            });
            expect(exBanking.deposit(username, initialAmount, "EUR")).toEqual({
                success: true,
                newBalance: initialAmount * 3,
            });

            expect(exBanking.deposit(username, initialAmount, "CHF")).toEqual({
                success: true,
                newBalance: initialAmount,
            });
            expect(exBanking.deposit(username, initialAmount * 2, "CHF")).toEqual({
                success: true,
                newBalance: initialAmount * 3,
            });
        });
    });

    describe("withdraw", () => {
        const exBanking = new ExBankingProvider();

        it("should return wrong arguments if negative amount, no username or currency provided", () => {
            const username = "Mark";
            exBanking.createUser(username);
            expect(exBanking.withdraw(username, -1, "EUR")).toEqual({
                success: false,
                message: ErrorMessage.WRONG_ARGUMENTS,
            });
            expect(exBanking.withdraw("", 10, "EUR")).toEqual({
                success: false,
                message: ErrorMessage.WRONG_ARGUMENTS,
            });
            expect(exBanking.withdraw(username, 10, "")).toEqual({
                success: false,
                message: ErrorMessage.WRONG_ARGUMENTS,
            });
            expect(exBanking.withdraw("", 10, "")).toEqual({
                success: false,
                message: ErrorMessage.WRONG_ARGUMENTS,
            });
        });

        it("should return user does not exist if wrong username", () => {
            const username = "Paul";
            expect(exBanking.deposit(username, 10, "EUR")).toEqual({
                success: false,
                message: ErrorMessage.USER_DOES_NOT_EXIST,
            });
        });

        it("should return not enough money if balance is less then amount", () => {
            const username = "Peter";
            const amount = 20;
            exBanking.createUser(username);
            // when balance is less then amount
            exBanking.deposit(username, amount / 2, "EUR");
            expect(exBanking.withdraw(username, amount, "EUR")).toEqual({
                success: false,
                message: ErrorMessage.NOT_ENOUGH_MONEY,
            });
            // when balance is 0
            expect(exBanking.withdraw(username, amount, "CHF")).toEqual({
                success: false,
                message: ErrorMessage.NOT_ENOUGH_MONEY,
            });
        });

        it("should withdraw and return success message with correct balance", () => {
            const initialAmount = 10;
            const username = "Paul";
            exBanking.createUser(username);
            exBanking.deposit(username, initialAmount * 3, "EUR");

            expect(exBanking.withdraw(username, initialAmount, "EUR")).toEqual({
                success: true,
                newBalance: initialAmount * 2,
            });
            expect(exBanking.withdraw(username, initialAmount, "EUR")).toEqual({
                success: true,
                newBalance: initialAmount,
            });
            expect(exBanking.withdraw(username, initialAmount, "EUR")).toEqual({
                success: true,
                newBalance: 0,
            });

            exBanking.deposit(username, initialAmount, "CHF");
            expect(exBanking.withdraw(username, initialAmount, "CHF")).toEqual({
                success: true,
                newBalance: 0,
            });
        });
    });

    describe("getBalance", () => {
        const exBanking = new ExBankingProvider();

        it("should return success message with currency wallet balance", () => {
            const username = "John";
            const currency = "USD";
            exBanking.createUser(username);

            expect(exBanking.getBalance(username, currency)).toEqual({
                success: true,
                balance: 0,
            });

            exBanking.deposit(username, 10, currency);
            expect(exBanking.getBalance(username, currency)).toEqual({
                success: true,
                balance: 10,
            });

            exBanking.deposit(username, 10, currency);
            exBanking.withdraw(username, 20, currency);
            expect(exBanking.getBalance(username, currency)).toEqual({
                success: true,
                balance: 0,
            });
        });

        it("should return error message if user not exist", () => {
            expect(exBanking.getBalance("John", "eur")).toEqual({
                success: false,
                message: ErrorMessage.USER_DOES_NOT_EXIST,
            });
        });
    });

    describe("send", () => {
        const exBanking = new ExBankingProvider();

        it("should return error sender / receiver does not exist", () => {
            const usernameExist = "John";
            const usernameNotExist = "Mark";
            exBanking.createUser(usernameExist);

            expect(
                exBanking.send(usernameNotExist, usernameExist, 20, "eur")
            ).toEqual({
                success: false,
                message: ErrorMessage.SENDER_DOES_NOT_EXIST,
            });

            expect(
                exBanking.send(usernameExist, usernameNotExist, 20, "eur")
            ).toEqual({
                success: false,
                message: ErrorMessage.RECEIVER_DOES_NOT_EXIST,
            });
        });

        it("should return error not enough money", () => {
            const fromUser = "John";
            const toUser = "Mark";
            const amount = 200;
            exBanking.createUser(fromUser);
            exBanking.createUser(toUser);

            expect(exBanking.send(fromUser, toUser, amount, "eur")).toEqual({
                success: false,
                message: ErrorMessage.NOT_ENOUGH_MONEY,
            });

            exBanking.deposit(fromUser, amount / 2, "eur");
            expect(exBanking.send(fromUser, toUser, amount, "eur")).toEqual({
                success: false,
                message: ErrorMessage.NOT_ENOUGH_MONEY,
            });
        });

        it("should send and return new balances for sender and receiver", () => {
            const fromUser = "John";
            const toUser = "Mark";
            exBanking.createUser(fromUser);
            exBanking.createUser(toUser);
            exBanking.deposit(fromUser, 100, "eur");
            let response = exBanking.send(fromUser, toUser, 50, "eur");
            expect(response).toEqual(
                expect.objectContaining({
                    fromUsernameBalance: 50,
                    toUsernameBalance: 50,
                })
            );
            response = exBanking.send(fromUser, toUser, 50, "eur");
            expect(response).toEqual(
                expect.objectContaining({
                    fromUsernameBalance: 0,
                    toUsernameBalance: 100,
                })
            );
        });
    });
});
