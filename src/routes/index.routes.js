import { Router } from "express";
import { connection } from "../database/db.js";

const router = Router();

router.get("/test", function (req, res) {
  let QUERY = "SELECT 1 + 1 as result";
  connection.query(QUERY, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});

export default router;
