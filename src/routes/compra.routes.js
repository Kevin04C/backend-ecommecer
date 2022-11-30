import { Router } from "express";
import { connection } from "../database/db.js";
import { cache } from "../middleware/cache.js";
import mercadoPagoConfig from "../mercadoPago.js";
import { generatePreferences } from "../helpers/generatePreferences.js";

const router = Router();

router.get("/api/ordersHistory/:id", cache, (req, res) => {
  let sql = `SELECT COMPRA_PRODUCTO_USUARIO.idVenta,DETALLE_COMPRA_PRODUCTO_USUARIO.idProductos,PRODUCTOS.imagenProducto,PRODUCTOS.nombreProducto, CATEGORIA.nombreCategoria,MARCA.nombreMarca,PRODUCTOS.precioUnitario,DETALLE_COMPRA_PRODUCTO_USUARIO.cantidad,DETALLE_COMPRA_PRODUCTO_USUARIO.totalDetalle, COMPRA_PRODUCTO_USUARIO.totalVenta, USUARIO.email,COMPRA_PRODUCTO_USUARIO.fechaVenta  FROM COMPRA_PRODUCTO_USUARIO INNER JOIN DETALLE_COMPRA_PRODUCTO_USUARIO on COMPRA_PRODUCTO_USUARIO.idVenta=DETALLE_COMPRA_PRODUCTO_USUARIO.idVenta INNER JOIN PRODUCTOS on DETALLE_COMPRA_PRODUCTO_USUARIO.idProductos=PRODUCTOS.idProductos INNER JOIN USUARIO on COMPRA_PRODUCTO_USUARIO.idUsuario=USUARIO.idUsuario INNER JOIN CATEGORIA on PRODUCTOS.idCategoria= CATEGORIA.idCategoria INNER JOIN MARCA on PRODUCTOS.idMarca=MARCA.idMarca WHERE USUARIO.idUsuario=?`;
  connection.query(sql, [req.params.id], (error, result) => {
    if (error) {
      throw error;
    } else {
      res.send({ok: true, orders: result});
    }
  });
});

//Consulta para insertar la VENTA de los productos
router.post("/api/compras/:id", (req, res) => {
  const id = req.params.id;
  const totalVenta = req.body.totalVenta;
  const idUsuario = req.body.idUsuario;
  const data = { totalVenta, idUsuario };

  let sql = "INSERT INTO COMPRA_PRODUCTO_USUARIO SET ?";
  connection.query(sql, data, function (error, result) {
    if (error) {
      throw error;
    } else {
      console.log(result);
      data.id = result.insertId;
      res.send({ ok: true, ...data });
    }
  });
});

//Consulta para insertar los detalle venta de los productos
router.post("/api/detalleCompras/:id", (req, res) => {
  const id = req.params.id;
  const cantidad = req.body.cantidad;
  const idProductos = req.body.idProductos;
  const totalDetalle = req.body.totalDetalle;
  const data = { cantidad, idProductos, totalDetalle };

  let sql = "INSERT INTO DETALLE_COMPRA_PRODUCTO_USUARIO SET ?";
  connection.query(sql, data, function (error, result) {
    if (error) {
      throw error;
    } else {
      data.id = result.insertId;
      res.send({ ok: true, ...data });
    }
  });
});

router.post("/api/payment/:idUser", (req, res) => {
  const { idUser } = req.params;
  const sql =
    "SELECT idCarrito,CARRITO.idProductos,CARRITO.idUsuario, cantidadCarrito, precio, nombreProducto,descripcion,precioUnitario,stock,imagenProducto,email,nombreMarca  FROM CARRITO INNER JOIN PRODUCTOS on CARRITO.idProductos=PRODUCTOS.idProductos INNER JOIN USUARIO on CARRITO.idUsuario=USUARIO.idUsuario INNER JOIN MARCA on PRODUCTOS.idMarca=MARCA.idMarca WHERE USUARIO.idUsuario = ?";
  connection.query(sql, [idUser], (err, result) => {
    if (err) {
      throw err;
    } else {
      const preference = generatePreferences(result);
      mercadoPagoConfig.preferences
        .create(preference)
        .then((response) => {
          res.status(200).json({ ok: true, url: response.body.init_point });
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  });
});

export default router;
