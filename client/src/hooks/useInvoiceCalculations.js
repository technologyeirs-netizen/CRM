export const useInvoiceCalculations = ({
  invoiceItems,
  globalDiscount,
  additionalCharges,
  applyTCS,
  selectedTCS,
  autoRoundOff,
  amountReceived,
}) => {

  const subtotal = invoiceItems.reduce((acc, item) => {
    const gross = (item.salesPrice || 0) * (item.qty || 1);

    const discountAmount =
      (gross * (item.discountOnSalesPrice || 0)) / 100 +
      (gross * (globalDiscount || 0)) / 100;

    const taxable = gross - discountAmount;

    const taxAmount =
      (taxable * (item.tax || item.gstTaxRate || 0)) / 100;

    return acc + taxable + taxAmount;
  }, 0);

  const taxableAmount =
    subtotal + Number(additionalCharges || 0);

  const tcsAmount =
    applyTCS && selectedTCS
      ? (taxableAmount * selectedTCS.rate) / 100
      : 0;

  const amountBeforeRound =
    taxableAmount + tcsAmount;

  const roundedTotal = autoRoundOff
    ? Math.round(amountBeforeRound)
    : amountBeforeRound;

  const roundOffDifference =
    roundedTotal - amountBeforeRound;

  const totalAmount = roundedTotal;

  const balanceAmount =
    totalAmount - Number(amountReceived || 0);

  const totalDiscount = invoiceItems.reduce(
    (acc, item) => {
      const gross =
        (item.salesPrice || 0) * (item.qty || 1);

      const itemDisc =
        (gross *
          (item.discountOnSalesPrice || 0)) /
        100;

      const globalDisc =
        (gross * (globalDiscount || 0)) / 100;

      return acc + itemDisc + globalDisc;
    },
    0
  );

  const totalTax = invoiceItems.reduce(
    (acc, item) => {
      const gross =
        (item.salesPrice || 0) * (item.qty || 1);

      const discountAmount =
        (gross *
          (item.discountOnSalesPrice || 0)) /
          100 +
        (gross * (globalDiscount || 0)) / 100;

      const taxable = gross - discountAmount;

      return (
        acc +
        (taxable *
          (item.tax || item.gstTaxRate || 0)) /
          100
      );
    },
    0
  );

  return {
    subtotal,
    taxableAmount,
    tcsAmount,
    roundOffDifference,
    totalAmount,
    balanceAmount,
    totalDiscount,
    totalTax,
  };
};