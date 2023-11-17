const deleteProduct = async (btn) => {
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;

  const productElement = btn.closest("article");
  console.log(productElement);
  let result = await fetch("/admin/product/" + prodId, {
    method: "delete",
    headers: {
      "csrf-token": csrf,
    },
  });

  let net = await result.json();
  productElement.remove();
  console.log(net);
};
