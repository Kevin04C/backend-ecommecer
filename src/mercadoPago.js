import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN_MERCADO_PAGO,
});

export default mercadopago;
