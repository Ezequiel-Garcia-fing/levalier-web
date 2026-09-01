// LÓGICA DE FILTROS DEL CATÁLOGO
document.addEventListener('DOMContentLoaded', () => {
    const botonesFiltro = document.querySelectorAll('.btn-filtro');
    const gruposDeportes = document.querySelectorAll('.grupo-deporte');

    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', () => {
            // 1. Efecto visual en los botones (píldoras)
            botonesFiltro.forEach(b => b.classList.remove('activo'));
            boton.classList.add('activo');

            // 2. Leemos qué categoría eligió el cliente
            const filtroSeleccionado = boton.getAttribute('data-filtro');

            // 3. Mostramos u ocultamos las categorías con un efecto instantáneo
            gruposDeportes.forEach(grupo => {
                if (filtroSeleccionado === 'todos') {
                    grupo.style.display = 'block';
                } else {
                    if (grupo.getAttribute('data-deporte') === filtroSeleccionado) {
                        grupo.style.display = 'block';
                    } else {
                        grupo.style.display = 'none';
                    }
                }
            });

            // 4. Hacemos un scroll suave calculando la distancia exacta
            const navbar = document.querySelector('.navbar');
            const barraFiltros = document.getElementById('barra-filtros');
            const contenedorCatalogo = document.querySelector('.contenedor-catalogo');
            
            // Medimos la altura real de ambas barras en este preciso momento
            const alturaNavbar = navbar ? navbar.offsetHeight : 0;
            const alturaFiltros = barraFiltros ? barraFiltros.offsetHeight : 0;
            
            // Calculamos el inicio de la sección de ropa y le descontamos las barras.
            // Sumamos 30px extra para asegurar que la foto del inicio quede totalmente oculta.
            const posicionDestino = contenedorCatalogo.offsetTop - alturaNavbar - alturaFiltros + 40;
            
            window.scrollTo({
                top: posicionDestino,
                behavior: 'smooth'
            });
        });
    });
});

// ==========================================
// MENÚ INTELIGENTE (Ocultar al bajar, mostrar al subir)
// ==========================================
let ultimoScroll = window.scrollY;
const navbar = document.querySelector('.navbar');
const barraFiltros = document.getElementById('barra-filtros');

// 1. Ajuste inicial: Al entrar a la página, ubicamos los filtros justo debajo de la navbar
if (barraFiltros && navbar) {
    barraFiltros.style.top = navbar.offsetHeight + 'px';
}

window.addEventListener('scroll', () => {
    let scrollActual = window.scrollY;
    
    // Si bajamos más de 150px y vamos hacia abajo -> Ocultamos menú principal
    if (scrollActual > 150 && scrollActual > ultimoScroll) {
        navbar.classList.add('oculta');
        if (barraFiltros) {
            barraFiltros.classList.add('tope');
            barraFiltros.style.top = '0px'; // Los filtros suben al borde de la pantalla
        }
    } 
    // Si vamos hacia arriba -> Mostramos menú principal
    else if (scrollActual < ultimoScroll) {
        navbar.classList.remove('oculta');
        if (barraFiltros) {
            barraFiltros.classList.remove('tope');
            // Magia pura: recalculamos la altura en vivo para que nunca se encimen
            barraFiltros.style.top = navbar.offsetHeight + 'px'; 
        }
    }
    
    ultimoScroll = scrollActual;
});