import jwt from "jsonwebtoken";

export const generateJWT = (payload) => {
  return jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: "2h",
  });
};
