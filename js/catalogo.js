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

            // 4. Hacemos un scroll suave hacia el inicio del catálogo
            const alturaBarra = document.getElementById('barra-filtros').offsetHeight;
            const topCatalogo = document.querySelector('.contenedor-catalogo').offsetTop;
            
            window.scrollTo({
                top: topCatalogo - alturaBarra - 90, // Descuenta la altura de la navbar y la barra de filtros
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

window.addEventListener('scroll', () => {
    let scrollActual = window.scrollY;
    
    // Si bajamos más de 150px y vamos hacia abajo -> Ocultamos menú
    if (scrollActual > 150 && scrollActual > ultimoScroll) {
        navbar.classList.add('oculta');
        if (barraFiltros) barraFiltros.classList.add('tope');
    } 
    // Si vamos hacia arriba -> Mostramos menú
    else if (scrollActual < ultimoScroll) {
        navbar.classList.remove('oculta');
        if (barraFiltros) barraFiltros.classList.remove('tope');
    }
    
    ultimoScroll = scrollActual;
});