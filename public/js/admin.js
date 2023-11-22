let deleteButtons = document.querySelectorAll(".delete-btn")
if (deleteButtons.length > 0){
deleteButtons.forEach(btn =>{

  btn.addEventListener('click' , async()=>{
    
    const prodId = btn.parentNode.querySelector("[name=productId]").value;
    const csrf = btn.parentNode.querySelector("[name=_csrf]").value;
  
    const productElement = btn.closest("article");
    let result = await fetch("/admin/product/" + prodId, {
      method: "delete",
      headers: {
        "csrf-token": csrf,
      },
    });
  
    if (result.status == 200){

      productElement.remove();
    }else{
      window.location.href = '/admin/products'
    }
  })

})

}
