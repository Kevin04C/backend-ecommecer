import { Router } from "express";
import { connection } from "../database/db.js";
import bycrypt from "bcrypt";
import { encryptPassword } from "../helpers/encryptPassword.js";
import { generateJWT } from "../helpers/jwt.js";
import { revalidateToken } from "../middleware/revalidateToken.js";

const router = Router();

router.post("/api/auth/crearUsuario", (req, res) => {
  const {
    dni,
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    direccion,
    contacto1,
    contacto2,
    email,
    password,
    foto,
    idRol,
  } = req.body;

  let data = {
    dni,
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    direccion,
    contacto1,
    contacto2,
    email,
    password,
    foto,
    idRol,
  };

  data.password = encryptPassword(password);
  let sqlSearchEmail = `SELECT * FROM USUARIO WHERE email = '${email}'`;
  let sqlSearchDni = `SELECT * FROM USUARIO WHERE dni = '${dni}'`;
  let sql = "INSERT INTO USUARIO SET ?";

  connection.query(sqlSearchEmail, function (error, result) {
    if (error) {
      throw error;
    } else {
      if (result.length > 0) {
        res.send({ ok: false, message: "Email ya existe" });
      } else {
        connection.query(sqlSearchDni, function (error, result) {
          if (error) {
            throw error;
          } else {
            if (result.length > 0) {
              res.send({ ok: false, message: "DNI ya existe" });
            } else {
              connection.query(sql, data, async function (error, result) {
                if (error) {
                  throw error;
                } else {
                  delete data.password;
                  const token = generateJWT(data);
                  data.token = token;

                  data.idUsuario = result.insertId;
                  res.send(data);
                }
              });
            }
          }
        });
      }
    }
  });
});
//VALIDA USUARIO
router.post("/api/auth/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let sqlForUser = `SELECT * FROM USUARIO WHERE email='${email}'`;
  connection.query(sqlForUser, async (error, result) => {
    if (error) {
      throw error;
    } else {
      if (result.length > 0) {
        const passwordEncrypt = result[0].password;
        const passwordCompare = bycrypt.compareSync(password, passwordEncrypt);
        if (passwordCompare) {
          delete result[0].password;

          const token = await generateJWT(result[0]);
          result[0].token = token;
          res.send(result[0]);
        } else {
          res.send({ ok: false, message: "Contraseña incorrecta" });
        }
      } else {
        res.send({ ok: false, message: "Correo incorrecto" });
      }
    }
  });
});

// RENUEVA EL TOKEN
router.post("/api/renew", revalidateToken, async (req, res) => {
  const payloadToken = req.body;
  const token = generateJWT(payloadToken);

  res.send({
    ok: true,
    ...payloadToken,
    token,
  });
});

//MOSTRAR 1 USUARIO

router.get("/api/auth/mostrarUsuario/:id", (req, res) => {
  connection.query(
    "SELECT * FROM USUARIO WHERE idUSUARIO=?",
    [req.params.id],
    (error, result) => {
      if (error) {
        throw error;
      } else {
        res.send(result);
      }
    }
  );
});

//ACTUALIZAR USUARIO
router.put("/api/auth/actualizarUsuario/:id", (req, res) => {
  const idUsuario = req.params.id;
  const {
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    direccion,
    contacto1,
    contacto2,
    fechaNacimiento,
    foto,
  } = req.body;

  let data = {
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    direccion,
    contacto1,
    contacto2,
    fechaNacimiento,
    foto,
    idUsuario,
  };
  let sql = `UPDATE USUARIO SET nombre=?,apellidoPaterno=?,apellidoMaterno=?,direccion=?,contacto1=?,contacto2=?,fechaNacimiento=?,foto=? WHERE idUsuario=${idUsuario}`;
  const arrayData = Array.from(Object.values(data));

  connection.query(sql, arrayData, function (error, results) {
    if (error) {
      return res.status(500).json({
        ok: faslse,
        msg: "Algo no salió bien",
      });
    }
    res.status(200).json({
      ok: true,
      message: "Usuario Actualizado",
      user: { ...data },
    });
  });
});

export default router;
