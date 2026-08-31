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