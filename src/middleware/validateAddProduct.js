import { response, request } from "express";
import { connection } from "../database/db.js";

export const validateAddProduct = (req = request, res = response, next) => {
  const idProductos = req.body.idProductos;
  const idUsuario = req.body.idUsuario;
  const cantidadCarrito = req.body.cantidadCarrito;
  const precio = req.body.precio;

  const sqlSearchProduct = "SELECT * FROM PRODUCTOS WHERE idProductos = ?";

  connection.query(sqlSearchProduct, [idProductos], (err, result) => {
    if (err) throw err;

    const stock = result[0].stock;

    if (stock >= cantidadCarrito) {
      req.body.idProductos = idProductos;
      req.body.idUsuario = idUsuario;
      req.body.cantidadCarrito = cantidadCarrito;
      req.body.precio = precio;
      next();
    } else {
      return res.send({ ok: false, message: "Stock no disponible" });
    }
  });
};
