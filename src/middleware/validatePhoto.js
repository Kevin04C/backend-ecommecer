import { request, response } from "express";

export const validatePhoto = (req = request, res = response, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      msg: "No ha selecionado archivos para subir",
    });
  }
  const file = req.files.photo;

  if (
    file.mimetype !== "image/png" &&
    file.mimetype !== "image/jpg" &&
    file.mimetype !== "image/jpeg"
  ) {
    
    return res.status(400).json({
      ok: false,
      msg: "Formato no válido",
    });
  }

  next();
};
