// ==========================================
// 1. LÓGICA DEL MENÚ DE NAVEGACIÓN (Scroll Spy)
// ==========================================
const seccionesNav = document.querySelectorAll('[data-nav]');
const enlacesMenu = document.querySelectorAll('.nav-item');

const observerMenu = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
        if(entrada.isIntersecting) {
            enlacesMenu.forEach(enlace => enlace.classList.remove('activo'));
            const navTarget = entrada.target.getAttribute('data-nav');
            const enlaceActivo = document.querySelector(`.nav-links a[href="#${navTarget}"]`);
            if(enlaceActivo) {
                enlaceActivo.classList.add('activo');
            }
        }
    });
}, { threshold: 0.3 });

seccionesNav.forEach(seccion => observerMenu.observe(seccion));

// ==========================================
// 2. LÓGICA DE ANIMACIÓN DE IMÁGENES
// ==========================================
const imagenAnimada = document.querySelector('.imagen-desplazable');

const observerAnimacion = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
        if(entrada.isIntersecting) {
            entrada.target.classList.add('aparecer');
        }
    });
}, { threshold: 0.2 });

if (imagenAnimada) {
    observerAnimacion.observe(imagenAnimada);
}

// ==========================================
// 3. SCROLL PERFECTO HACIA ARRIBA PARA "INICIO"
// ==========================================
const enlacesInicio = document.querySelectorAll('a[href="#inicio"]');
enlacesInicio.forEach(enlace => {
    enlace.addEventListener('click', function(e) {
        e.preventDefault(); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    });
});
// ==========================================
// 4. TRANSICIONES FLUIDAS ENTRE PÁGINAS (VERSIÓN DEFINITIVA)
// ==========================================

// A. GESTIÓN DE ENTRADA Y LIMPIEZA DE CACHÉ
window.addEventListener('pageshow', function() {
    const contenedor = document.getElementById('contenedor-animado');
    if (!contenedor) return;

    // Limpieza extrema de clases viejas
    contenedor.classList.remove('salir-hacia-izquierda', 'salir-hacia-derecha', 'entrar-desde-derecha', 'entrar-desde-izquierda');

    const direccionEntrada = sessionStorage.getItem('animacionEntrada');
    
    if (direccionEntrada === 'desde-derecha') {
        void contenedor.offsetWidth; // Fuerza al navegador a reiniciar la animación
        contenedor.classList.add('entrar-desde-derecha');
        sessionStorage.removeItem('animacionEntrada');
    } else if (direccionEntrada === 'desde-izquierda') {
        void contenedor.offsetWidth;
        contenedor.classList.add('entrar-desde-izquierda');
        sessionStorage.removeItem('animacionEntrada');
    }
});

// B. GESTIÓN DE SALIDA (AL HACER CLIC)
document.addEventListener('DOMContentLoaded', () => {
    const enlacesTransicion = document.querySelectorAll('.link-transicion');
    
    enlacesTransicion.forEach(enlace => {
        enlace.addEventListener('click', function(e) {
            const destino = this.getAttribute('href'); 
            
            // Evitamos animar si es un enlace que solo baja en la misma página (ej: #nosotros)
            if (destino.startsWith('#')) return; 

            e.preventDefault(); 
            const contenedor = document.getElementById('contenedor-animado');
            
            // RED DE SEGURIDAD: Si no hay caja animada, cambiamos de página normal para no bloquear la web
            if (!contenedor) {
                window.location.href = destino;
                return;
            }

            const direccionSalida = this.getAttribute('data-salida');

            if (direccionSalida === 'izquierda') {
                contenedor.classList.add('salir-hacia-izquierda');
                sessionStorage.setItem('animacionEntrada', 'desde-derecha');
            } else {
                contenedor.classList.add('salir-hacia-derecha');
                sessionStorage.setItem('animacionEntrada', 'desde-izquierda');
            }

            // Esperamos a que termine la animación y viajamos
            setTimeout(() => {
                window.location.href = destino;
            }, 400);
        });
    });
});

// ==========================================
// INTERCEPCIÓN DEL BOTÓN CATÁLOGO (EN CONSTRUCCIÓN)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const btnLanzamiento = document.getElementById('btn-lanzamiento');
    const modalConstruccion = document.getElementById('modal-construccion');
    const btnCerrarModal = document.getElementById('cerrar-modal');
    const btnEntendido = document.getElementById('btn-entendido');

    if (btnLanzamiento && modalConstruccion) {
        // 1. Al hacer clic en el botón, evitamos ir al catálogo y mostramos el modal
        btnLanzamiento.addEventListener('click', (e) => {
            e.preventDefault(); // Frena la navegación
            modalConstruccion.classList.add('activo');
        });

        // 2. Cerrar con la cruz
        btnCerrarModal.addEventListener('click', () => {
            modalConstruccion.classList.remove('activo');
        });

        // 3. Cerrar con el botón "Entendido"
        btnEntendido.addEventListener('click', () => {
            modalConstruccion.classList.remove('activo');
        });

        // 4. Cerrar haciendo clic afuera del cartel blanco
        window.addEventListener('click', (e) => {
            if (e.target === modalConstruccion) {
                modalConstruccion.classList.remove('activo');
            }
        });
    }
});