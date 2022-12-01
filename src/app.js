import express from "express";
import cors from "cors";
import indexRoutes from "./routes/index.routes.js";
import authRoutes from "./routes/auth.routes.js";
import ecommerceRoutes from "./routes/ecommer.routes.js";
import carritoRoutes from "./routes/carrito.routes.js";
import compraRoutes from "./routes/compra.routes.js";
import fileUpload from "express-fileupload";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));
app.use(express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use(indexRoutes);
app.use(authRoutes);
app.use(ecommerceRoutes);
app.use(carritoRoutes);
app.use(compraRoutes);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
