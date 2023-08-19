export const isIntegerString = (s?: string) => {
  const n = parseFloat(s);
  return !isNaN(n) && Number.isInteger(n);
};

export const getObjectFirstValue = (obj: object) => {
  return obj[Object.keys(obj)[0]];
};
