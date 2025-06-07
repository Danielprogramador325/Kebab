  let pedidoLista = [];

  // Elementos DOM
  const productosListaDiv = document.getElementById("productosLista");
  const numeroProductoInput = document.getElementById("numeroProducto");
  const recomendacionProductoDiv = document.getElementById("recomendacionProducto");
  const opcionSimpleCompletaDiv = document.getElementById("opcionSimpleCompletaDiv");
  const opcionSimpleCompletaSelect = document.getElementById("opcionSimpleCompleta");
  const opcionMenuBebidaDiv = document.getElementById("opcionMenuBebidaDiv");
  const opcionMenuBebidaSelect = document.getElementById("opcionMenuBebida");
  const opcionMenuSalsaDiv = document.getElementById("opcionMenuSalsaDiv");
  const opcionMenuSalsaSelect = document.getElementById("opcionMenuSalsa");
  const observacionesInput = document.getElementById("observaciones");
  const precioProductoInput = document.getElementById("precioProducto");
  const agregarPedidoBtn = document.getElementById("agregarPedidoBtn");
  const pedidoBody = document.getElementById("pedidoBody");
  const totalGeneralSpan = document.getElementById("totalGeneral");
  const totalPendienteSpan = document.getElementById("totalPendiente");
  const nuevoPedidoBtn = document.getElementById("nuevoPedidoBtn");

  // Mostrar productos con número
  function mostrarListaProductos() {
    let html = "";
    productos.forEach(p => {
      html += `${p.id}. ${p.nombre} - €${p.precio.toFixed(2)}<br />`;
    });
    productosListaDiv.innerHTML = html;
  }

  function actualizarOpciones() {
    const num = parseInt(numeroProductoInput.value);
    if (isNaN(num) || num < 1 || num > productos.length) {
      recomendacionProductoDiv.textContent = "";
      opcionSimpleCompletaDiv.style.display = "none";
      opcionMenuBebidaDiv.style.display = "none";
      opcionMenuSalsaDiv.style.display = "none";
      precioProductoInput.value = "";
      observacionesInput.value = "";
      return;
    }
    const producto = productos.find(p => p.id === num);
    recomendacionProductoDiv.textContent = producto ? producto.nombre : "";

    // Mostrar precio base
    precioProductoInput.value = producto.precio.toFixed(2);
    observacionesInput.value = "";

    // Opciones según tipo
    // Para hamburguesas y baguettes (ids 23-34, 35-43 menús hamburguesas, baguettes si las añades)
    if (
      (num >= 23 && num <= 34) ||
      (num >= 36 && num <= 43) 
    ) {
      opcionSimpleCompletaDiv.style.display = "block";
    } else {
      opcionSimpleCompletaDiv.style.display = "none";
    }

    // Mostrar opciones menú (bebida y salsa) para menús (6-10 y 35-43)
    if (
      (num >= 6 && num <= 10) || 
      (num >= 35 && num <= 43)
    ) {
      opcionMenuBebidaDiv.style.display = "block";
      opcionMenuSalsaDiv.style.display = "block";
      opcionMenuBebidaSelect.value = "Agua grande";
      opcionMenuSalsaSelect.value = "Salsa blanca";
    } else {
      opcionMenuBebidaDiv.style.display = "none";
      opcionMenuSalsaDiv.style.display = "none";
      opcionMenuBebidaSelect.value = "Sin bebida";
      opcionMenuSalsaSelect.value = "Salsa blanca";
    }
  }

  // Guardar pedido en localStorage
  function guardarPedidoLocalStorage() {
    localStorage.setItem("pedidoLista", JSON.stringify(pedidoLista));
  }

  // Cargar pedido desde localStorage
  function cargarPedidoLocalStorage() {
    const data = localStorage.getItem("pedidoLista");
    if (data) {
      pedidoLista = JSON.parse(data);
    }
  }

  // Mostrar pedido en tabla
  function mostrarPedido() {
    pedidoBody.innerHTML = "";
    pedidoLista.forEach(item => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.nombre}</td>
        <td>${item.opcionSimpleCompleta || "-"}</td>
        <td>${item.bebida || "-"}</td>
        <td>${item.salsa || "-"}</td>
        <td>${item.observaciones || "-"}</td>
        <td>€${item.precio.toFixed(2)}</td>
        <td class="checkbox-center">
          <input type="checkbox" ${item.pagado ? "checked" : ""} onchange="marcarPagado(${item.id}, this.checked)" />
        </td>
        <td class="checkbox-center">
          <input type="checkbox" ${item.entregado ? "checked" : ""} onchange="marcarEntregado(${item.id}, this.checked)" />
        </td>
        <td class="checkbox-center">
          <button onclick="eliminarProducto(${item.id})" style="background:#c0392b; color:#fff; border:none; border-radius:4px; cursor:pointer;" title="Eliminar solo si está pagado y entregado">Eliminar</button>
        </td>
      `;

      pedidoBody.appendChild(tr);
    });
    actualizarTotales();
  }

  // Actualizar totales
  function actualizarTotales() {
    let total = 0;
    let pendiente = 0;
    pedidoLista.forEach(item => {
      total += item.precio;
      if (!item.pagado) pendiente += item.precio;
    });
    totalGeneralSpan.textContent = total.toFixed(2);
    totalPendienteSpan.textContent = pendiente.toFixed(2);
  }

  // Agregar producto al pedido
  function agregarProducto() {
    const num = parseInt(numeroProductoInput.value);
    if (isNaN(num) || num < 1 || num > productos.length) {
      alert("Por favor, introduce un número válido de producto.");
      return;
    }

    let precio = parseFloat(precioProductoInput.value);
    if (isNaN(precio) || precio < 0) {
      alert("Introduce un precio válido.");
      return;
    }

    const producto = productos.find(p => p.id === num);
    if (!producto) {
      alert("Producto no encontrado.");
      return;
    }

    // Generar un ID único para el pedido (incremental o timestamp)
    let nuevoId = Date.now();

    const itemPedido = {
      id: nuevoId,
      numeroProducto: num,
      nombre: producto.nombre,
      opcionSimpleCompleta: opcionSimpleCompletaDiv.style.display === "block" ? opcionSimpleCompletaSelect.value : "",
      bebida: opcionMenuBebidaDiv.style.display === "block" ? opcionMenuBebidaSelect.value : "",
      salsa: opcionMenuSalsaDiv.style.display === "block" ? opcionMenuSalsaSelect.value : "",
      observaciones: observacionesInput.value.trim(),
      precio: precio,
      pagado: false,
      entregado: false,
    };

    pedidoLista.push(itemPedido);
    guardarPedidoLocalStorage();
    mostrarPedido();
    limpiarCampos();
  }

  // Limpiar campos tras agregar
  function limpiarCampos() {
    numeroProductoInput.value = "";
    recomendacionProductoDiv.textContent = "";
    opcionSimpleCompletaDiv.style.display = "none";
    opcionMenuBebidaDiv.style.display = "none";
    opcionMenuSalsaDiv.style.display = "none";
    opcionSimpleCompletaSelect.value = "simple";
    opcionMenuBebidaSelect.value = "Agua grande";
    opcionMenuSalsaSelect.value = "Salsa blanca";
    observacionesInput.value = "";
    precioProductoInput.value = "";
  }

  // Marcar pagado
  function marcarPagado(id, valor) {
    const item = pedidoLista.find(p => p.id === id);
    if (item) {
      item.pagado = valor;
      guardarPedidoLocalStorage();
      mostrarPedido();
    }
  }

  // Marcar entregado
  function marcarEntregado(id, valor) {
    const item = pedidoLista.find(p => p.id === id);
    if (item) {
      item.entregado = valor;
      guardarPedidoLocalStorage();
      mostrarPedido();
    }
  }

  // Eliminar producto solo si pagado y entregado
  function eliminarProducto(id) {
    const idx = pedidoLista.findIndex(p => p.id === id);
    if (idx === -1) return;
    if (pedidoLista[idx].pagado && pedidoLista[idx].entregado) {
      pedidoLista.splice(idx, 1);
      guardarPedidoLocalStorage();
      mostrarPedido();
    } else {
      alert("Solo puede eliminar productos que estén pagados y entregados.");
    }
  }

  // Nuevo pedido (borrar todo)
  function nuevoPedido() {
    if (confirm("¿Seguro que quieres borrar todo el pedido?")) {
      pedidoLista = [];
      guardarPedidoLocalStorage();
      mostrarPedido();
      limpiarCampos();
    }
  }

  // Funciones globales para que funcionen en onChange y onClick en HTML
  window.marcarPagado = marcarPagado;
  window.marcarEntregado = marcarEntregado;
  window.eliminarProducto = eliminarProducto;

  // Eventos
  numeroProductoInput.addEventListener("input", actualizarOpciones);
  agregarPedidoBtn.addEventListener("click", agregarProducto);
  nuevoPedidoBtn.addEventListener("click", nuevoPedido);

  // Al cargar la página
  window.onload = () => {
    mostrarListaProductos();
    cargarPedidoLocalStorage();
    mostrarPedido();
  };