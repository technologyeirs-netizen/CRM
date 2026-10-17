// Client ka address object ho ya string, hamesha ek poori line banata hai:
// "street, city, state, zipCode, country"
export const formatAddress = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address.trim();

  return [
    address.street,
    address.city,
    address.state,
    address.zipCode || address.pincode,
    address.country,
  ]
    .filter((part) => part && String(part).trim())
    .join(", ");
};
