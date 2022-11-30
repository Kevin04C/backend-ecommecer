import bycrypt from "bcrypt";

export const encryptPassword = (password) => {
  const salt = bycrypt.genSaltSync();
  return bycrypt.hashSync(password, salt);
};
