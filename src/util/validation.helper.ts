import { ErrorMessage } from "../types";

export const validateUsername = (username: string): boolean => {
    if (!username || !username.length)
        throw new Error(ErrorMessage.WRONG_ARGUMENTS);
    return true;
};

export const validateAmount = (amount: number): boolean => {
    if (amount < 0) throw new Error(ErrorMessage.WRONG_ARGUMENTS);
    return true;
};

export const validateCurrency = (currency: string): boolean => {
    if (currency.length == 0) throw new Error(ErrorMessage.WRONG_ARGUMENTS);
    // add validation of currency type if needed
    const notAllowedCurrencies: string[] = [];
    const notValid = notAllowedCurrencies.some(c => c == currency);
    if (notValid) throw new Error(ErrorMessage.CURRENCY_NOT_ALLOWED)

    return true;
};

export const validateWalletAction = (
    username: string,
    amount: number,
    currency: string
) => {
    return (
        validateUsername(username) &&
        validateAmount(amount) &&
        validateCurrency(currency)
    );
};
