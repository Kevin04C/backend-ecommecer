export const generatePreferences = (products) => {
  const preference = {
    items: products.map((product) => ({
      id: product.idProductos,
      title: product.nombreProducto,
      description: product.descripcion.slice(0, 25),
      quantity: product.cantidadCarrito,
      currency_id: "PEN",
      unit_price: Number(product.precioUnitario),
    })),
    back_urls: {
      success: process.env.URL_SUCCESS,
      failure: process.env.URL_FAILURE,
    },
  };
  return preference;
};
