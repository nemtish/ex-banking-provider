export const roundAmountWithDecimal = (
    amount: number,
    decimal: number
): number => {
    return parseFloat(amount.toFixed(decimal));
};
