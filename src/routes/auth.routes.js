import { Router } from "express";
import { connection } from "../database/db.js";
import bycrypt from "bcrypt";
import { encryptPassword } from "../helpers/encryptPassword.js";
import { generateJWT } from "../helpers/jwt.js";
import { revalidateToken } from "../middleware/revalidateToken.js";
import { validatePhoto } from "../middleware/validatePhoto.js";
import { removePhoto, uploadPhoto } from "../utilities/cloudinary.js";

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
    idRol,
  };

  data.password = encryptPassword(password);
  const sqlSearchEmail = `SELECT * FROM USUARIO WHERE email = '${email}'`;
  const sqlSearchDni = `SELECT * FROM USUARIO WHERE dni = '${dni}'`;
  const sql = "INSERT INTO USUARIO SET ?";
  const sqlInsertPhoto = "INSERT INTO FOTO_USUARIO (idUsuario) VALUES (?)";
  const sqlGetPhoto = "SELECT secure_url from FOTO_USUARIO WHERE idUsuario = ?";

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
                  return res.status(500).json({
                    ok: false,
                    msg: "Algo salió mal",
                  });
                } else {
                  delete data.password;
                  const token = generateJWT(data);
                  data.token = token;

                  const idUsuario = result.insertId;
                  data.idUsuario = idUsuario;

                  connection.query(
                    sqlInsertPhoto,
                    [idUsuario],
                    (error, result) => {
                      if (error) {
                        console.log(error);
                        return res.status(500).json({
                          ok: false,
                          msg: "Algo salió mal",
                        });
                      }
                      connection.query(
                        sqlGetPhoto,
                        [idUsuario],
                        (error, result) => {
                          if (error) {
                            return res.status(500).json({
                              ok: false,
                              msg: "Algo salió mal",
                            });
                          }
                          res.status(200).json({
                            ...data,
                            secure_url: result[0].secure_url,
                          });
                        }
                      );
                    }
                  );
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
  const email = req.body.email;
  const password = req.body.password;

  const queryGetUser = `SELECT * FROM USUARIO WHERE email=?`;
  const queryGetPhoto = `SELECT secure_url FROM FOTO_USUARIO WHERE idUsuario=?`;

  connection.query(queryGetUser, email, async (error, result) => {
    if (error) {
      throw error;
    } else {
      if (result.length > 0) {
        const passwordEncrypt = result[0].password;
        const passwordCompare = bycrypt.compareSync(password, passwordEncrypt);
        if (passwordCompare) {
          delete result[0].password;

          const token = generateJWT(result[0]);
          result[0].token = token;
          const user = result[0];
          connection.query(
            queryGetPhoto,
            result[0].idUsuario,
            (error, result) => {
              if (error) {
                console.log(error);
                return res.status(500).json({
                  ok: false,
                  msg: "Algó salio mal",
                });
              }
              const { secure_url } = result[0];
              res.status(200).json({
                ok: true,
                ...user,
                secure_url,
              });
            }
          );
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
  const query = "SELECT secure_url FROM FOTO_USUARIO WHERE idUsuario = ?";

  connection.query(query, payloadToken.idUsuario, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({
        ok: false,
        msg: "Algo salió mal",
      });
    }
    const { secure_url } = result[0];

    res.status(200).json({
      ok: true,
      ...payloadToken,
      secure_url,
      token,
    });
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
  } = req.body;

  let data = {
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    direccion,
    contacto1,
    contacto2,
    idUsuario,
  };
  let sql = `UPDATE USUARIO SET nombre=?,apellidoPaterno=?,apellidoMaterno=?,direccion=?,contacto1=?,contacto2=? WHERE idUsuario=?`;
  const arrayData = Array.from(Object.values(data));

  connection.query(sql, arrayData, function (error, results) {
    if (error) {
      console.log(error);
      return res.status(500).json({
        ok: false,
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

router.put("/api/auth/uploadPhoto/:id", validatePhoto, async (req, res) => {
  const { id } = req.params;
  const photo = req.files.photo;
  const query = "SELECT * FROM FOTO_USUARIO WHERE idUsuario = ?";
  const queryUpdate =
    "UPDATE FOTO_USUARIO SET secure_url = ?, public_id = ? WHERE idUsuario = ?";
  let public_id;

  try {
    connection.query(query, id, async (error, result) => {
      if (error) {
        return res.status(500).json({
          ok: false,
          msg: "Algo salió mal",
        });
      }
      public_id = result[0]["public_id"];

      if (!public_id) {
        const { secure_url, public_id } = await uploadPhoto(photo.tempFilePath);
        connection.query(
          queryUpdate,
          [secure_url, public_id, id],
          (error, result) => {
            if (error) {
              return res.status(500).json({
                ok: false,
                msg: "Algo salió mal",
              });
            }
            res.status(200).json({
              ok: true,
              secure_url,
            });
          }
        );
      } else {
        await removePhoto(public_id);

        const { secure_url, public_id: public_id_new } = await uploadPhoto(
          photo.tempFilePath
        );
        connection.query(
          queryUpdate,
          [secure_url, public_id_new, id],
          (error, result) => {
            if (error) {
              return res.status(500).json({
                ok: false,
                msg: "Algo salió mal",
              });
            }

            res.status(200).json({
              ok: true,
              secure_url,
            });
          }
        );
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Ups, algo salió mal",
    });
  }
});

export default router;
