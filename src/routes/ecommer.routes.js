import { Router } from "express";
import { connection } from "../database/db.js";
import { cache } from "../middleware/cache.js";

const router = Router();

router.get("/api/ecommerce/products", cache, (req, res) => {
  const sql =
    "SELECT idProductos, nombreProducto, descripcion, precioUnitario, stock,imagenProducto, nombreCategoria, nombreMarca FROM PRODUCTOS INNER JOIN CATEGORIA on PRODUCTOS.idCategoria=CATEGORIA.idCategoria INNER JOIN MARCA on PRODUCTOS.idMarca=MARCA.idMarca";
  connection.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});

router.get("/api/ecommerce/product/:id", cache, (req, res) => {
  const id = req.params.id;
  const sql =
    "SELECT idProductos, nombreProducto, descripcion, precioUnitario, stock,imagenProducto, nombreCategoria, nombreMarca FROM PRODUCTOS INNER JOIN CATEGORIA on PRODUCTOS.idCategoria=CATEGORIA.idCategoria INNER JOIN MARCA on PRODUCTOS.idMarca=MARCA.idMarca WHERE idProductos = ?";

  connection.query(sql, [id], (err, result) => {
    if (err) {
      throw err;
    } else {
      if (result.length > 0) {
        res.send({ ok: true, result: result[0] });
      } else {
        res.send({ ok: false, message: "Producto no encontrado" });
      }
    }
  });
});

router.get("/api/ecommerce/search/:query", (req, res) => {
  const { query } = req.params;
  const sql = `SELECT * FROM PRODUCTOS WHERE LOWER(nombreProducto) LIKE '%${query}%';`;

  if (!query) return res.status(400).send({ ok: false, message: "Hubo un error" });

  connection.query(sql, (err, result) => {
    if (err) throw err;

    if (result <= 0) return res.send({ ok: true, search: [] });

    res.send({ ok: true, search: result });
  
  });
});

export default router;
