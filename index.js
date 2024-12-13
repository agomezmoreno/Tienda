// URL base de la API
const baseUrl = "https://api.escuelajs.co/api/v1/products/";

// Variables para la paginación
let offset = 0;
const limit = 10; // Cargar 10 productos por vez
let isLoading = false;
let hasMoreProducts = true;

// Iniciar cuando la página cargue
window.onload = () => {
    iniciar();
}

// Función principal
function iniciar() {
    cargarCategorias();
    cargarProductos();
    // Añadir eventos a los botones de navegación de categorías
    const prevBtn = document.querySelector('.categorias-nav.prev');
    const nextBtn = document.querySelector('.categorias-nav.next');
    prevBtn.addEventListener('click', () => desplazarCategorias(-1)); // Desplazar hacia la izquierda
    nextBtn.addEventListener('click', () => desplazarCategorias(1)); // Desplazar hacia la derecha
}

// Función para desplazar categorías
function desplazarCategorias(direccion) {
    const contenedor = document.querySelector('.categorias');
    contenedor.scrollBy({ left: 1000 * direccion, behavior: 'smooth' }); // Desplazar 1000px en la dirección indicada
}

// Función para cargar productos con paginación
function cargarProductos() {
    if (isLoading || !hasMoreProducts) return;
    
    isLoading = true;
    const loadingOffset = offset; // Guardar el offset actual

    fetch(`${baseUrl}?offset=${loadingOffset}&limit=${limit}`)
        .then(respuesta => respuesta.json())
        .then(productos => {
            if (productos.length < limit) {
                hasMoreProducts = false;
            }
            mostrarProductos(productos, loadingOffset === 0);
            offset = loadingOffset + productos.length; // Actualizar offset con la cantidad real
            isLoading = false;
        })
        .catch(error => {
            console.error('Error:', error);
            isLoading = false;
        });
}

// Función para cargar categorías
function cargarCategorias() {
    fetch('https://api.escuelajs.co/api/v1/categories')
        .then(respuesta => respuesta.json())
        .then(categorias => mostrarCategorias(categorias))
        .catch(error => console.error('Error:', error));
}

// Función para mostrar productos
function mostrarProductos(productos, limpiarContenedor = false) {
    const contenedor = document.querySelector('.productos-grid');
    
    if (limpiarContenedor) {
        contenedor.innerHTML = '';
        // Eliminar el botón cargar más si existe
        const botonExistente = document.querySelector('.cargar-mas-btn');
        if (botonExistente) botonExistente.remove();
    }
    
    productos.forEach(product => {
        const tarjetaProducto = crearTarjetaProducto(product);
        contenedor.appendChild(tarjetaProducto);
    });

    // Añadir botón "Cargar Más" si hay más productos
    if (hasMoreProducts) {
        const botonCargarMas = document.createElement('button');
        botonCargarMas.className = 'cargar-mas-btn';
        botonCargarMas.innerHTML = '<i class="fas fa-plus"></i> Cargar más productos';
        botonCargarMas.addEventListener('click', () => {
            const categoriaActiva = document.querySelector('.categoria-item.active');
            if (categoriaActiva) {
                const categoriaId = categoriaActiva.dataset.categoryId;
                if (categoriaId === '0') {
                    cargarProductos();
                } else {
                    cargarProductosPorCategoria(parseInt(categoriaId));
                }
            } else {
                cargarProductos();
            }
        });
        contenedor.appendChild(botonCargarMas);
    } else {
        console.log('No hay más productos para cargar');
    }
}

// Función para mostrar categorías
function mostrarCategorias(categorias) {
    const contenedor = document.querySelector('.categorias');
    contenedor.innerHTML = ''; // Limpiar contenedor

    // Opción todas las categorias
    const todasCat = document.createElement('div');
    todasCat.className = 'categoria-item';
    todasCat.dataset.categoryId = '0'; // Añadir ID para "todas"

    const todasIcon = document.createElement('div');
    todasIcon.className = 'categoria-icon';
    todasIcon.innerHTML = '<i class="fas fa-th-large"></i>';

    const todasInfo = document.createElement('div');
    todasInfo.className = 'categoria-info';

    const todasNombre = document.createElement('span');
    todasNombre.className = 'categoria-nombre';
    todasNombre.innerText = 'Todas';

    const todasCount = document.createElement('span');
    todasCount.className = 'categoria-count';
    todasCount.innerText = 'Ver todo';

    todasInfo.append(todasNombre, todasCount);
    todasCat.append(todasIcon, todasInfo);

    todasCat.addEventListener('click', () => {
        mostrarTodo();
        activarCategoria(todasCat);
    });

    contenedor.appendChild(todasCat);

    // Crear elementos para cada categoría
    categorias.forEach(categoria => {
        const categoriaElement = document.createElement('div');
        categoriaElement.className = 'categoria-item';
        categoriaElement.dataset.categoryId = categoria.id; // Guardar ID en el elemento

        const icono = document.createElement('div');
        icono.className = 'categoria-icon';
        icono.innerHTML = `<i class="fas ${obtenerIconoCategoria(categoria.name)}"></i>`;

        const info = document.createElement('div');
        info.className = 'categoria-info';

        const nombre = document.createElement('span');
        nombre.className = 'categoria-nombre';
        nombre.innerText = categoria.name;

        const count = document.createElement('span');
        count.className = 'categoria-count';
        count.innerText = `${categoria.id} productos`;

        info.append(nombre, count);
        categoriaElement.append(icono, info);

        // Event listener para filtrar productos
        categoriaElement.addEventListener('click', () => {
            offset = 0; // Reiniciar offset al cambiar de categoría
            hasMoreProducts = true;
            cargarProductosPorCategoria(categoria.id);
            activarCategoria(categoriaElement);
        });

        contenedor.appendChild(categoriaElement);
    });
}

// Función auxiliar para asignar iconos según la categoría
function obtenerIconoCategoria(nombreCategoria) {
    const iconos = {
        'Clothes': 'fa-tshirt',
        'Electronics': 'fa-laptop',
        'Furniture': 'fa-couch',
        'Shoes': 'fa-shoe-prints',
        'Others': 'fa-box'
    };
    return iconos[nombreCategoria] || 'fa-tag';
}

// Función auxiliar para marcar categoría activa
function activarCategoria(elemento) {
    desactivarTodasLasCategorias();
    elemento.classList.add('active');
    
    // Reiniciar scroll
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cargarProductosPorCategoria(categoriaId) {
    // Reiniciar el estado
    offset = 0;
    hasMoreProducts = true;
    isLoading = true;

    const productosGrid = document.querySelector('.productos-grid');
    productosGrid.style.display = 'grid';
    productosGrid.innerHTML = ''; // Limpiar contenedor

    // Guardar el ID de la categoría activa
    productosGrid.dataset.categoriaActiva = categoriaId;

    fetch(`https://api.escuelajs.co/api/v1/categories/${categoriaId}/products?offset=${offset}&limit=${limit}`)
        .then(response => response.json())
        .then(productos => {
            if (productos.length < limit) {
                hasMoreProducts = false;
            }
            mostrarProductos(productos); // Forzar limpieza del contenedor
            offset += limit;
            isLoading = false;
        })
        .catch(error => {
            console.error('Error:', error);
            isLoading = false;
        });
}

// Función para mostrar todos los productos
function mostrarTodo() {
    // Reiniciar completamente el estado
    offset = 0;
    hasMoreProducts = true;
    isLoading = false;
    
    const productosGrid = document.querySelector('.productos-grid');
    productosGrid.innerHTML = '';
    productosGrid.style.display = 'grid';
    productosGrid.classList.add('active');
    
    // Eliminar referencia a categoría activa
    delete productosGrid.dataset.categoriaActiva;

    // Activar la categoría "Todas"
    const todasCategoria = document.querySelector('.categoria-item[data-category-id="0"]');
    if (todasCategoria) {
        activarCategoria(todasCategoria);
    }
    
    ocultarSiguenosYNewsletter();
    
    // Cargar productos iniciales
    cargarProductos();
}

// Función para desactivar todas las categorías
function desactivarTodasLasCategorias() {
    const categorias = document.querySelectorAll('.categoria-item');
    categorias.forEach(cat => cat.classList.remove('active'));
}

function crearTarjetaProducto(producto) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'producto';
    
    // Añadir evento de clic a toda la tarjeta
    tarjeta.addEventListener('click', () => {
        mostrarDetalleProducto(producto);
    });

    // Contenedor de imagen
    const imagenContainer = document.createElement('div');
    imagenContainer.className = 'producto-imagen-container';

    // Imagen principal
    const img = document.createElement('img');
    img.src = (producto.images && producto.images.length > 0) ? producto.images[0] : 'images/default.jpg';
    img.alt = producto.title;
    img.onerror = () => img.src = 'images/default.jpg';
    imagenContainer.appendChild(img);

    // Acciones rápidas
    const accionesRapidas = document.createElement('div');
    accionesRapidas.className = 'acciones-rapidas';
    
    const btnComprar = document.createElement('button');
    btnComprar.className = 'accion-btn';
    btnComprar.innerHTML = '<i class="fas fa-shopping-cart"></i>';
    btnComprar.title = 'Añadir al carrito';
    
    const btnDetalles = document.createElement('button');
    btnDetalles.className = 'accion-btn';
    btnDetalles.innerHTML = '<i class="fas fa-eye"></i>';
    btnDetalles.title = 'Ver detalles';
    
    accionesRapidas.appendChild(btnComprar);
    accionesRapidas.appendChild(btnDetalles);
    imagenContainer.appendChild(accionesRapidas);

    // Contenedor de información
    const infoContainer = document.createElement('div');
    infoContainer.className = 'producto-info';

    // Categoría
    const categoria = document.createElement('span');
    categoria.className = 'producto-categoria';
    categoria.textContent = producto.category?.name || 'Sin categoría';
    infoContainer.appendChild(categoria);

    // Título del producto
    const titulo = document.createElement('h3');
    titulo.className = 'producto-titulo';
    titulo.innerText = producto.title;

    // Descripción corta
    const descripcion = document.createElement('p');
    descripcion.className = 'producto-descripcion';
    descripcion.textContent = `${producto.description.slice(0, 60)}...`;

    // Precio con formato
    const precio = document.createElement('div');
    precio.className = 'producto-precio';
    precio.innerHTML = `$ ${producto.price}`;

    // Agregar elementos al contenedor de información
    infoContainer.appendChild(titulo);
    infoContainer.appendChild(descripcion);
    infoContainer.appendChild(precio);

    // Construir tarjeta
    tarjeta.appendChild(imagenContainer);
    tarjeta.appendChild(infoContainer);

    // Modificar los eventos de los botones para evitar la propagación
    btnDetalles.addEventListener('click', (e) => {
        e.stopPropagation(); // Evitar que se propague al evento de la tarjeta
        mostrarDetalleProducto(producto);
    });

    btnComprar.addEventListener('click', (e) => {
        e.stopPropagation(); // Evitar que se propague al evento de la tarjeta
        alert(`Producto añadido al carrito: ${producto.title}`);
    });

    return tarjeta;
}

function mostrarDetalleProducto(producto) {
    const contenedor = document.querySelector('.productos-grid');
    contenedor.innerHTML = '';
    contenedor.style.display = 'block'; // Cambiamos a display block para el detalle
    contenedor.classList.add('vista-detalle'); // Añadimos esta clase para mejor control

    const detalleContainer = document.createElement('div');
    detalleContainer.className = 'detalle-producto';

    // Contenedor izquierdo para imágenes
    const imagenContainer = document.createElement('div');
    imagenContainer.className = 'detalle-imagen-container';

    // Imagen principal
    const img = document.createElement('img');
    img.className = 'detalle-imagen-principal';
    img.src = (producto.images && producto.images.length > 0) ? producto.images[0] : 'images/default.jpg';
    img.alt = producto.title;
    img.onerror = () => img.src = 'images/default.jpg';

    // Galería de miniaturas
    const galeria = document.createElement('div');
    galeria.className = 'detalle-galeria';
    if (producto.images) {
        producto.images.forEach((imgUrl, index) => {
            const miniatura = document.createElement('img');
            miniatura.src = imgUrl;
            miniatura.className = 'detalle-miniatura';
            miniatura.addEventListener('click', () => {
                img.src = imgUrl;
                document.querySelectorAll('.detalle-miniatura').forEach(m => m.classList.remove('active'));
                miniatura.classList.add('active');
            });
            if (index === 0) miniatura.classList.add('active');
            galeria.appendChild(miniatura);
        });
    }

    imagenContainer.appendChild(img);
    imagenContainer.appendChild(galeria);

    // Contenedor derecho para información
    const infoContainer = document.createElement('div');
    infoContainer.className = 'detalle-info';

    // Cabecera con categoría
    const categoriaTag = document.createElement('div');
    categoriaTag.className = 'detalle-categoria-tag';
    categoriaTag.innerHTML = `<i class="fas ${obtenerIconoCategoria(producto.category?.name)}"></i> ${producto.category?.name || 'Sin categoría'}`;

    // Título y precio
    const titulo = document.createElement('h1');
    titulo.className = 'detalle-titulo';
    titulo.innerText = producto.title;

    const precio = document.createElement('div');
    precio.className = 'detalle-precio';
    precio.innerHTML = `<span class="precio-valor">${producto.price.toLocaleString()}</span>`;

    // Descripción
    const descripcion = document.createElement('div');
    descripcion.className = 'detalle-descripcion-container';
    descripcion.innerHTML = `
        <h3>Descripción</h3>
        <p>${producto.description}</p>
    `;

    // Contenedor de acciones
    const accionesContainer = document.createElement('div');
    accionesContainer.className = 'detalle-acciones';

    const btnComprar = document.createElement('button');
    btnComprar.className = 'detalle-btn-comprar';
    btnComprar.innerHTML = '<i class="fas fa-shopping-cart"></i> Añadir al carrito';
    btnComprar.addEventListener('click', () => alert(`Producto añadido al carrito: ${producto.title}`));

    const btnVolver = document.createElement('button');
    btnVolver.className = 'detalle-btn-volver';
    btnVolver.innerHTML = '<i class="fas fa-arrow-left"></i> Volver';
    btnVolver.addEventListener('click', () => {
        contenedor.classList.remove('vista-detalle'); // Removemos la clase
        contenedor.style.display = 'grid'; // Restauramos el grid
        mostrarTodo();
    });

    accionesContainer.appendChild(btnComprar);
    accionesContainer.appendChild(btnVolver);

    // Información adicional
    const infoAdicional = document.createElement('div');
    infoAdicional.className = 'detalle-info-adicional';
    infoAdicional.innerHTML = `
        <div class="info-item">
            <i class="fas fa-calendar"></i>
            <span>Creado: ${new Date(producto.creationAt).toLocaleDateString()}</span>
        </div>
        <div class="info-item">
            <i class="fas fa-sync"></i>
            <span>Actualizado: ${new Date(producto.updatedAt).toLocaleDateString()}</span>
        </div>
    `;

    // Agregar todos los elementos al contenedor de información
    infoContainer.appendChild(categoriaTag);
    infoContainer.appendChild(titulo);
    infoContainer.appendChild(precio);
    infoContainer.appendChild(descripcion);
    infoContainer.appendChild(accionesContainer);
    infoContainer.appendChild(infoAdicional);

    // Construir la vista de detalle
    detalleContainer.appendChild(imagenContainer);
    detalleContainer.appendChild(infoContainer);
    contenedor.appendChild(detalleContainer);
}

function volverAProductos() {
    const productosGrid = document.querySelector('.productos-grid');
    
    // Restaurar el display grid
    productosGrid.style.display = 'grid';
    productosGrid.innerHTML = '';
    
    // Reiniciar estado
    offset = 0;
    hasMoreProducts = true;
    isLoading = false;

    // Verificar categoría activa y cargar productos correspondientes
    const categoriaActiva = document.querySelector('.categoria-item.active');
    if (categoriaActiva) {
        const categoriaId = categoriaActiva.dataset.categoryId;
        if (categoriaId === '0') {
            mostrarTodo();
        } else {
            cargarProductosPorCategoria(parseInt(categoriaId));
        }
    } else {
        mostrarTodo();
    }
}

function ocultarSiguenosYNewsletter() {
    const siguenosyNewsletter = document.querySelectorAll('.siguenos-section, .newsletter-section');
    for (let section of siguenosyNewsletter) {
        section.style.display = 'none';
    }
}
