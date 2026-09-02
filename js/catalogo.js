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

// ==========================================
// LÓGICA DE CARRUSELES TIPO INSTAGRAM
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const carruseles = document.querySelectorAll('.carrusel-producto');

    carruseles.forEach(carrusel => {
        const pista = carrusel.querySelector('.pista-carrusel');
        const btnPrev = carrusel.querySelector('.prev');
        const btnNext = carrusel.querySelector('.next');
        const puntos = carrusel.querySelectorAll('.punto');
        // Cuenta cuántas fotos hay adentro (usamos children.length por si pones <img> en vez de los div)
        const totalSlides = pista.children.length; 
        let slideActual = 0;

        function actualizarCarrusel() {
            // Mueve la pista hacia la izquierda según el número de foto
            pista.style.transform = `translateX(-${slideActual * 100}%)`;
            
            // Actualiza los puntitos blancos
            puntos.forEach((punto, index) => {
                if(index === slideActual) punto.classList.add('activo');
                else punto.classList.remove('activo');
            });
            
            // Esconde la flecha izquierda si estamos en la primer foto, y la derecha en la última
            if (btnPrev) btnPrev.style.display = slideActual === 0 ? 'none' : 'flex';
            if (btnNext) btnNext.style.display = slideActual === totalSlides - 1 ? 'none' : 'flex';
        }

        if (btnNext) {
            btnNext.addEventListener('click', (e) => {
                e.preventDefault(); 
                if (slideActual < totalSlides - 1) {
                    slideActual++;
                    actualizarCarrusel();
                }
            });
        }

        if (btnPrev) {
            btnPrev.addEventListener('click', (e) => {
                e.preventDefault();
                if (slideActual > 0) {
                    slideActual--;
                    actualizarCarrusel();
                }
            });
        }

        // Ejecutar una vez al cargar para configurar las flechas y puntos iniciales
        actualizarCarrusel();
        // Soporte táctil para celulares (Swipe)
        let touchStartX = 0;
        let touchEndX = 0;

        pista.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        pista.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            // Si el cliente desliza hacia la izquierda más de 50px
            if (touchStartX - touchEndX > 50 && slideActual < totalSlides - 1) {
                slideActual++;
                actualizarCarrusel();
            } 
            // Si el cliente desliza hacia la derecha más de 50px
            else if (touchEndX - touchStartX > 50 && slideActual > 0) {
                slideActual--;
                actualizarCarrusel();
            }
        }, { passive: true });
    });
});

// ==========================================
// DESPLAZAMIENTO LATERAL DE FILTROS EN PC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const contenedorScroll = document.getElementById('contenedor-scroll-filtros');
    const btnIzq = document.getElementById('scroll-izq');
    const btnDer = document.getElementById('scroll-der');

    if (contenedorScroll && btnIzq && btnDer) {
        function actualizarVisibilidadFlechas() {
            const scrollActual = contenedorScroll.scrollLeft;
            const maxScroll = contenedorScroll.scrollWidth - contenedorScroll.clientWidth;

            // Flecha Izquierda: si estamos al principio del scroll, se oculta
            if (scrollActual <= 5) {
                btnIzq.classList.add('oculto');
            } else {
                btnIzq.classList.remove('oculto');
            }

            // Flecha Derecha: si no sobra contenido o ya llegamos al final, se oculta
            if (maxScroll <= 5 || scrollActual >= maxScroll - 5) {
                btnDer.classList.add('oculto');
            } else {
                btnDer.classList.remove('oculto');
            }
        }

        // Desplazamiento al hacer clic
        btnDer.addEventListener('click', () => {
            contenedorScroll.scrollBy({ left: 320, behavior: 'smooth' });
        });

        btnIzq.addEventListener('click', () => {
            contenedorScroll.scrollBy({ left: -320, behavior: 'smooth' });
        });

        // Escuchadores de eventos para actualizar visibilidad en vivo
        contenedorScroll.addEventListener('scroll', actualizarVisibilidadFlechas);
        window.addEventListener('resize', actualizarVisibilidadFlechas);

        // Comprobación inicial al cargar
        actualizarVisibilidadFlechas();
        window.addEventListener('load', actualizarVisibilidadFlechas);
    }
});