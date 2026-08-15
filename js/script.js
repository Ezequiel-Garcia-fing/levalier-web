// ==========================================
// 0. LÓGICA DE NAVEGACIÓN Y MENÚ LATERAL (Actualizado)
// ==========================================
const sidebar = document.getElementById('sidebar');
const btnMenu = document.getElementById('btn-menu');
const itemsMenu = document.querySelectorAll('.menu-item');
const modulosPrendas = document.querySelectorAll('.modulo-prenda');

// Función central que abre/cierra y anima el botón junto con el menú
function alternarMenu() {
    sidebar.classList.toggle('abierta');
    btnMenu.classList.toggle('btn-desplazado');
    
    // Si el menú se abrió, el botón cambia a rojo y dice "Cerrar"
    if (sidebar.classList.contains('abierta')) {
        btnMenu.innerHTML = '&times; Cerrar';
        btnMenu.style.backgroundColor = 'var(--rojo-levalier)';
    } else {
        // Si se cerró, vuelve a ser azul y dice "Menú"
        btnMenu.innerHTML = '☰ Prendas';
        btnMenu.style.backgroundColor = 'var(--azul-levalier)';
    }
}

// Al tocar el botón superior, ejecutamos la función
btnMenu.addEventListener('click', alternarMenu);

// Navegar entre prendas (Remera -> Pantalón, etc.)
itemsMenu.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault(); // Evita que la página salte hacia arriba
        
        // 1. Cambiamos el color rojo al botón seleccionado en el menú
        itemsMenu.forEach(i => i.classList.remove('activo'));
        item.classList.add('activo');

        // 2. Apagamos todos los módulos (ocultamos todo)
        modulosPrendas.forEach(modulo => modulo.classList.remove('activo'));

        // 3. Leemos el 'data-target' para encender el módulo correcto
        const moduloObjetivo = item.getAttribute('data-target');
        document.getElementById(moduloObjetivo).classList.add('activo');

        // 4. Cerramos el menú lateral automáticamente (si está abierto)
        if (sidebar.classList.contains('abierta')) {
            alternarMenu();
        }
    });
});
// ==========================================
// --- VARIABLES DEL ENTORNO ---
const tarjetasModelo = document.querySelectorAll('.tarjeta-modelo');
let modeloActualGlobal = 'liso'; // Guardamos el estado actual
const patronMitadFrente = document.getElementById('patron-mitad-frente');
const patronMitadEspalda = document.getElementById('patron-mitad-espalda');
const patronRayasFrente = document.getElementById('patron-rayas-frente');
const patronRayasEspalda = document.getElementById('patron-rayas-espalda');

const contenedorColor2 = document.getElementById('contenedor-color-2');
const contenedorSlider = document.getElementById('contenedor-slider');
const labelColor1 = document.getElementById('label-color-1');
const labelColor2 = document.getElementById('label-color-2');
const labelSlider = document.getElementById('label-slider');

const selectorCuerpo = document.getElementById('selector-cuerpo');
const selectorPatron = document.getElementById('selector-patron');
const selectorMangas = document.getElementById('selector-mangas');
const sliderCorte = document.getElementById('slider-corte');

const capaCuerpo = document.getElementById('color-cuerpo');
const capaMangas = document.getElementById('color-mangas');

// --- FUNCIÓN CENTRAL: ACTUALIZAR DISEÑOS ---
function actualizarPatrones() {
    const colorSecundario = selectorPatron.value;
    const valorSlider = sliderCorte.value;
    const modeloActual = modeloActualGlobal;

    if (modeloActual === 'mitad') {
        // Lógica para la mitad
        patronMitadFrente.style.backgroundColor = colorSecundario;
        patronMitadEspalda.style.backgroundColor = colorSecundario;
        patronMitadFrente.style.width = valorSlider + '%';
        patronMitadEspalda.style.width = valorSlider + '%';
    } 
else if (modeloActual === 'rayas') {
        const anchoRaya = valorSlider; 
        const gradiente = `repeating-linear-gradient(to right, transparent, transparent ${anchoRaya}%, ${colorSecundario} ${anchoRaya}%, ${colorSecundario} ${anchoRaya * 2}%)`;
        
        // Aplicamos el gradiente simétricamente a ambas mitades
        patronRayasFrente.style.background = gradiente;
        patronRayasEspalda.style.background = gradiente;
    }
}

// --- EVENTOS: CLIC EN LAS TARJETAS VISUALES ---
tarjetasModelo.forEach(tarjeta => {
    tarjeta.addEventListener('click', () => {
        // 1. Efecto visual: quitar la clase 'activa' a todas y ponérsela a la que clickeamos
        tarjetasModelo.forEach(t => t.classList.remove('activa'));
        tarjeta.classList.add('activa');

        // 2. Leer qué modelo eligió (liso, mitad, o rayas)
        const modelo = tarjeta.getAttribute('data-modelo');
        modeloActualGlobal = modelo;
        
        // 3. Reseteamos visuales del lienzo
        patronMitadFrente.style.display = 'none';
        patronMitadEspalda.style.display = 'none';
        patronRayasFrente.style.display = 'none';
        patronRayasEspalda.style.display = 'none';

        // 4. Mostramos y ocultamos los controles según el modelo
        if (modelo === 'mitad') {
            patronMitadFrente.style.display = 'block';
            patronMitadEspalda.style.display = 'block';
            contenedorColor2.classList.remove('oculto');
            contenedorSlider.classList.remove('oculto');
            
            labelColor1.innerText = 'Color Principal (Derecha):';
            labelColor2.innerText = 'Color Secundario (Izquierda):';
            labelSlider.innerText = 'Ajustar Centro del Corte:';
            
            sliderCorte.max = 50; 
            sliderCorte.step = 0.5;
            
        } else if (modelo === 'rayas') {
            patronRayasFrente.style.display = 'block';
            patronRayasEspalda.style.display = 'block';
            contenedorColor2.classList.remove('oculto');
            contenedorSlider.classList.remove('oculto');
            
            labelColor1.innerText = 'Color Base:';
            labelColor2.innerText = 'Color de Rayas:';
            labelSlider.innerText = 'Grosor de las Rayas:';
            
            sliderCorte.max = 20; 
            sliderCorte.step = 1;
            
        } else { 
            // Modelo Liso / Clásico
            contenedorColor2.classList.add('oculto');
            contenedorSlider.classList.add('oculto');
            labelColor1.innerText = 'Color Principal:';
        }
        
        // 5. Aplicar los colores al nuevo modelo
        actualizarPatrones();
    });
});

// Escuchadores de inputs (colores y slider)
selectorCuerpo.addEventListener('input', (e) => capaCuerpo.style.backgroundColor = e.target.value);
selectorMangas.addEventListener('input', (e) => capaMangas.style.backgroundColor = e.target.value);
selectorPatron.addEventListener('input', actualizarPatrones);
sliderCorte.addEventListener('input', actualizarPatrones);

// --- MOTOR DE LOGOS (Fabric.js) ---
const canvas = new fabric.Canvas('canvas-logos');

document.getElementById('subir-logo').addEventListener('change', function(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = function(evento) {
        fabric.Image.fromURL(evento.target.result, function(img) {
            if (img.width > 150) img.scaleToWidth(150);
            
            img.set({
                left: 200, top: 200,
                cornerColor: '#0055ff', cornerStrokeColor: '#ffffff',
                cornerSize: 12, transparentCorners: false
            });
            
            canvas.add(img);
            canvas.setActiveObject(img);
        });
    };
    lector.readAsDataURL(archivo);
    // =========================================
// NUEVO: LÓGICA PARA ELIMINAR LOGO REMERA
// =========================================

// Identificamos el botón en el HTML
const btnEliminarRemera = document.getElementById('btn-eliminar-logo-remera');

// Mostrar el botón cuando el cliente toca un logo en la remera
canvas.on('selection:created', function() {
    btnEliminarRemera.classList.remove('oculto');
});

// Mantener el botón visible si cambia la selección de un logo a otro
canvas.on('selection:updated', function() {
    btnEliminarRemera.classList.remove('oculto');
});

// Ocultar el botón cuando el cliente toca la remera vacía (deselecciona)
canvas.on('selection:cleared', function() {
    btnEliminarRemera.classList.add('oculto');
});

// Acción de borrar al hacer clic en el botón
if (btnEliminarRemera) {
    btnEliminarRemera.addEventListener('click', function() {
        const logoActivo = canvas.getActiveObject();
        if (logoActivo) {
            canvas.remove(logoActivo);     // Lo elimina del dibujo
            canvas.discardActiveObject();  // Quita los cuadraditos de selección
            canvas.requestRenderAll();     // Refresca la imagen de la remera
        }
    });
}
    e.target.value = ''; 
});


// ==========================================
// MÓDULO PANTALÓN CORTO
// ==========================================

const selectorPantalon = document.getElementById('selector-pantalon');
const capaPantalon = document.getElementById('color-pantalon');

// 1. Cambiar color
selectorPantalon.addEventListener('input', (e) => {
    capaPantalon.style.backgroundColor = e.target.value;
});

// 2. Motor de logos para el pantalón
const canvasPantalon = new fabric.Canvas('canvas-logos-pantalon');

document.getElementById('subir-logo-pantalon').addEventListener('change', function(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = function(evento) {
        fabric.Image.fromURL(evento.target.result, function(img) {
            // Los logos de pantalones (números/escudos) suelen ser más chicos
            if (img.width > 80) img.scaleToWidth(80); 
            
            img.set({
                left: 200, top: 250, // Lo hacemos aparecer un poco más abajo
                cornerColor: '#0055ff', cornerStrokeColor: '#ffffff',
                cornerSize: 12, transparentCorners: false
            });
            
            canvasPantalon.add(img);
            canvasPantalon.setActiveObject(img);
        });
    };
    lector.readAsDataURL(archivo);
    e.target.value = ''; 
});

// =========================================
// NUEVO: LÓGICA PARA ELIMINAR LOGO PANTALÓN
// =========================================

// Identificamos el botón en el HTML
const btnEliminarPantalon = document.getElementById('btn-eliminar-logo-pantalon');

// Mostrar el botón cuando el cliente toca un logo
canvasPantalon.on('selection:created', function() {
    btnEliminarPantalon.classList.remove('oculto');
});

// Mantener el botón visible si cambia la selección de un logo a otro
canvasPantalon.on('selection:updated', function() {
    btnEliminarPantalon.classList.remove('oculto');
});

// Ocultar el botón cuando el cliente toca el fondo vacío (deselecciona)
canvasPantalon.on('selection:cleared', function() {
    btnEliminarPantalon.classList.add('oculto');
});

// Acción de borrar al hacer clic en el botón
if (btnEliminarPantalon) {
    btnEliminarPantalon.addEventListener('click', function() {
        const logoActivo = canvasPantalon.getActiveObject();
        if (logoActivo) {
            canvasPantalon.remove(logoActivo);     // Lo elimina del dibujo
            canvasPantalon.discardActiveObject();  // Quita los cuadraditos de selección
            canvasPantalon.requestRenderAll();     // Refresca la imagen
        }
    });
}


// ==========================================
// MÓDULO MUSCULOSA (Simplificado)  <--- ¡ACÁ EMPIEZA LO QUE PEGÁS!
// ==========================================

// 1. CAMBIO DE CORTE HOMBRE / MUJER
const botonesGenero = document.querySelectorAll('#modulo-musculosa .btn-genero');
const capaCuerpoMusc = document.getElementById('color-cuerpo-musc');
const capaRibetesMusc = document.getElementById('color-ribetes-musc');
const texturaCuerpoMusc = document.getElementById('textura-cuerpo-musc');
const texturaRibetesMusc = document.getElementById('textura-ribetes-musc');

botonesGenero.forEach(boton => {
    boton.addEventListener('click', () => {
        // Efecto visual: cambiar el botón activo
        botonesGenero.forEach(b => b.classList.remove('activa'));
        boton.classList.add('activa');
        
        // Cambio de imágenes dinámico
        const genero = boton.getAttribute('data-genero');
        const rutaCuerpo = `url('../imagenes/musculosa_cuerpo_${genero}.png')`;
        const rutaRibetes = `url('../imagenes/musculosa_ribetes_${genero}.png')`;

        capaCuerpoMusc.style.webkitMaskImage = rutaCuerpo;
        capaCuerpoMusc.style.maskImage = rutaCuerpo;
        capaRibetesMusc.style.webkitMaskImage = rutaRibetes;
        capaRibetesMusc.style.maskImage = rutaRibetes;

        texturaCuerpoMusc.style.backgroundImage = rutaCuerpo;
        texturaRibetesMusc.style.backgroundImage = rutaRibetes;
    });
});

// 2. CAMBIO DE COLORES
const selectorCuerpoMusc = document.getElementById('selector-cuerpo-musc');
const selectorRibetesMusc = document.getElementById('selector-ribetes-musc');

selectorCuerpoMusc.addEventListener('input', (e) => capaCuerpoMusc.style.backgroundColor = e.target.value);
selectorRibetesMusc.addEventListener('input', (e) => capaRibetesMusc.style.backgroundColor = e.target.value);

// 3. MOTOR DE LOGOS
const canvasMusc = new fabric.Canvas('canvas-logos-musc');
document.getElementById('subir-logo-musc').addEventListener('change', function(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = function(evento) {
        fabric.Image.fromURL(evento.target.result, function(img) {
            if (img.width > 150) img.scaleToWidth(150);
            img.set({ left: 200, top: 200, cornerColor: '#0055ff', cornerStrokeColor: '#ffffff', cornerSize: 12, transparentCorners: false });
            canvasMusc.add(img); canvasMusc.setActiveObject(img);
        });
    };
    lector.readAsDataURL(archivo);
    const btnEliminarMusc = document.getElementById('btn-eliminar-logo-musc');

if (typeof canvasMusc !== 'undefined') {
    canvasMusc.on('selection:created', () => btnEliminarMusc.classList.remove('oculto'));
    canvasMusc.on('selection:updated', () => btnEliminarMusc.classList.remove('oculto'));
    canvasMusc.on('selection:cleared', () => btnEliminarMusc.classList.add('oculto'));

    if (btnEliminarMusc) {
        btnEliminarMusc.addEventListener('click', function() {
            const logo = canvasMusc.getActiveObject();
            if (logo) {
                canvasMusc.remove(logo);
                canvasMusc.discardActiveObject();
                canvasMusc.requestRenderAll();
            }
        });
    }
}
    e.target.value = ''; 
});

// ==========================================
// MÓDULO MEDIAS
// ==========================================

const botonesColorMedias = document.querySelectorAll('#modulo-medias .btn-color');
const capaColorMedias = document.getElementById('color-medias');

// 1. Lógica para la paleta de colores
botonesColorMedias.forEach(boton => {
    boton.addEventListener('click', () => {
        // Le sacamos el borde azul a todos
        botonesColorMedias.forEach(b => b.classList.remove('activa'));
        // Le ponemos el borde azul al que clickeamos
        boton.classList.add('activa');
        // Extraemos el color de la etiqueta data-color y pintamos la media
        capaColorMedias.style.backgroundColor = boton.getAttribute('data-color');
    });
});

// 2. Motor de logos para medias
const canvasMedias = new fabric.Canvas('canvas-logos-medias');
document.getElementById('subir-logo-medias').addEventListener('change', function(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = function(evento) {
        fabric.Image.fromURL(evento.target.result, function(img) {
            // Los logos en medias suelen ser más chicos (ej: escudos)
            if (img.width > 60) img.scaleToWidth(60); 
            img.set({ left: 350, top: 250, cornerColor: '#0055ff', cornerStrokeColor: '#ffffff', cornerSize: 12, transparentCorners: false });
            canvasMedias.add(img); canvasMedias.setActiveObject(img);
        });
    };
    lector.readAsDataURL(archivo);
    const btnEliminarMedias = document.getElementById('btn-eliminar-logo-medias');

if (typeof canvasMedias !== 'undefined') {
    canvasMedias.on('selection:created', () => btnEliminarMedias.classList.remove('oculto'));
    canvasMedias.on('selection:updated', () => btnEliminarMedias.classList.remove('oculto'));
    canvasMedias.on('selection:cleared', () => btnEliminarMedias.classList.add('oculto'));

    if (btnEliminarMedias) {
        btnEliminarMedias.addEventListener('click', function() {
            const logo = canvasMedias.getActiveObject();
            if (logo) {
                canvasMedias.remove(logo);
                canvasMedias.discardActiveObject();
                canvasMedias.requestRenderAll();
            }
        });
    }
}
    e.target.value = ''; 
});

// ==========================================
// MÓDULO GORRAS TRUCKER
// ==========================================

const selectorColorGorra = document.getElementById('selector-color-gorra');
const capaColorGorra = document.getElementById('color-red-gorra');

// 1. Cambiar color de red y solapa
selectorColorGorra.addEventListener('input', (e) => {
    capaColorGorra.style.backgroundColor = e.target.value;
});

// 2. Motor de logos para gorras
const canvasGorras = new fabric.Canvas('canvas-logos-gorras');
document.getElementById('subir-logo-gorra').addEventListener('change', function(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;
    
    const lector = new FileReader();
    lector.onload = function(evento) {
        fabric.Image.fromURL(evento.target.result, function(img) {
            // Los logos en gorras van en el frente y suelen ser de tamaño medio
            if (img.width > 90) img.scaleToWidth(90); 
            
            img.set({ 
                left: 350, top: 220, 
                cornerColor: '#0055ff', cornerStrokeColor: '#ffffff', 
                cornerSize: 12, transparentCorners: false 
            });
            
            canvasGorras.add(img); 
            canvasGorras.setActiveObject(img);
        });
    };
    lector.readAsDataURL(archivo);
    const btnEliminarGorras = document.getElementById('btn-eliminar-logo-gorras');

if (typeof canvasGorras !== 'undefined') {
    canvasGorras.on('selection:created', () => btnEliminarGorras.classList.remove('oculto'));
    canvasGorras.on('selection:updated', () => btnEliminarGorras.classList.remove('oculto'));
    canvasGorras.on('selection:cleared', () => btnEliminarGorras.classList.add('oculto'));

    if (btnEliminarGorras) {
        btnEliminarGorras.addEventListener('click', function() {
            const logo = canvasGorras.getActiveObject();
            if (logo) {
                canvasGorras.remove(logo);
                canvasGorras.discardActiveObject();
                canvasGorras.requestRenderAll();
            }
        });
    }
}
    e.target.value = ''; 
});

// ==========================================
// MÓDULO GORRAS DE GABARDINA
// ==========================================

const selectorColorGorraGabardina = document.getElementById('selector-color-gorra-gabardina');
const capaColorGorraGabardina = document.getElementById('color-gorra-gabardina');

// 1. Cambiar color de la gorra completa
selectorColorGorraGabardina.addEventListener('input', (e) => {
    capaColorGorraGabardina.style.backgroundColor = e.target.value;
});

// 2. Motor de logos para gorras de gabardina
const canvasGorrasGabardina = new fabric.Canvas('canvas-logos-gorras-gabardina');
document.getElementById('subir-logo-gorra-gabardina').addEventListener('change', function(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;
    
    const lector = new FileReader();
    lector.onload = function(evento) {
        fabric.Image.fromURL(evento.target.result, function(img) {
            if (img.width > 90) img.scaleToWidth(90); 
            
            img.set({ 
                left: 350, top: 220, 
                cornerColor: '#0055ff', cornerStrokeColor: '#ffffff', 
                cornerSize: 12, transparentCorners: false 
            });
            
            canvasGorrasGabardina.add(img); 
            canvasGorrasGabardina.setActiveObject(img);
        });
    };
    lector.readAsDataURL(archivo);
    const btnEliminarGorrasGab = document.getElementById('btn-eliminar-logo-gorras-gab');

if (typeof canvasGorrasGabardina !== 'undefined') {
    canvasGorrasGabardina.on('selection:created', () => btnEliminarGorrasGab.classList.remove('oculto'));
    canvasGorrasGabardina.on('selection:updated', () => btnEliminarGorrasGab.classList.remove('oculto'));
    canvasGorrasGabardina.on('selection:cleared', () => btnEliminarGorrasGab.classList.add('oculto'));

    if (btnEliminarGorrasGab) {
        btnEliminarGorrasGab.addEventListener('click', function() {
            const logo = canvasGorrasGabardina.getActiveObject();
            if (logo) {
                canvasGorrasGabardina.remove(logo);
                canvasGorrasGabardina.discardActiveObject();
                canvasGorrasGabardina.requestRenderAll();
            }
        });
    }
}
    e.target.value = ''; 
});

// ==========================================
// EVENTO GLOBAL DE BORRAR (ACTUALIZADO CON GORRAS GABARDINA)
// ==========================================
// ¡Borrá el viejo window.addEventListener('keydown') y pegá este!
window.addEventListener('keydown', function(e) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        
        // --- REMERA ---
        const objRemera = typeof canvas !== 'undefined' ? canvas.getActiveObject() : null;
        if (objRemera) {
            canvas.remove(objRemera);
            canvas.discardActiveObject(); // Desmarca para que se oculte el botón
            canvas.requestRenderAll();
        }
        
        // --- PANTALÓN ---
        const objPantalon = typeof canvasPantalon !== 'undefined' ? canvasPantalon.getActiveObject() : null;
        if (objPantalon) {
            canvasPantalon.remove(objPantalon);
            canvasPantalon.discardActiveObject();
            canvasPantalon.requestRenderAll();
        }

        // --- MUSCULOSA ---
        const objMusc = typeof canvasMusc !== 'undefined' ? canvasMusc.getActiveObject() : null;
        if (objMusc) {
            canvasMusc.remove(objMusc);
            canvasMusc.discardActiveObject();
            canvasMusc.requestRenderAll();
        }

        // --- MEDIAS ---
        const objMedias = typeof canvasMedias !== 'undefined' ? canvasMedias.getActiveObject() : null;
        if (objMedias) {
            canvasMedias.remove(objMedias);
            canvasMedias.discardActiveObject();
            canvasMedias.requestRenderAll();
        }
        
        // --- GORRAS ---
        const objGorras = typeof canvasGorras !== 'undefined' ? canvasGorras.getActiveObject() : null;
        if (objGorras) {
            canvasGorras.remove(objGorras);
            canvasGorras.discardActiveObject();
            canvasGorras.requestRenderAll();
        }
        
        // --- GORRAS GABARDINA ---
        const objGorrasGab = typeof canvasGorrasGabardina !== 'undefined' ? canvasGorrasGabardina.getActiveObject() : null;
        if (objGorrasGab) {
            canvasGorrasGabardina.remove(objGorrasGab);
            canvasGorrasGabardina.discardActiveObject();
            canvasGorrasGabardina.requestRenderAll();
        }
    }
});

// ==========================================
// LOGO INTELIGENTE (PÁGINA PRINCIPAL)
// ==========================================
const logoInicio = document.getElementById('logo-inicio');

if (logoInicio && !window.location.pathname.includes('configurador')) {
    logoInicio.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// =========================================
// INICIALIZACIÓN UNIVERSAL DE PICKR
// =========================================

document.querySelectorAll('.pickr-contenedor').forEach(contenedor => {
    const targetId = contenedor.getAttribute('data-target');
    const colorPorDefecto = contenedor.getAttribute('data-default') || '#ffffff';
    const inputOculto = document.getElementById(targetId);

    const pickr = Pickr.create({
        el: contenedor,
        theme: 'classic',
        default: colorPorDefecto,
        swatches: [
            '#ffffff', '#1a1e29', '#e32627', '#0055ff', '#f09433', '#25D366', '#000000'
        ],
        components: {
            preview: true, 
            opacity: false, 
            hue: true, 
            interaction: {
                hex: true,  
                input: true, 
                clear: false,
                save: false  /* <-- ¡ACÁ ESTÁ EL CAMBIO! Apagamos el botón */
            }
        }
    });

// EVENTO: Cuando el cliente mueve el dedo por los colores (cambio en vivo)
    pickr.on('change', (color, source, instance) => {
        const colorHex = color.toHEXA().toString();
        if (inputOculto) {
            inputOculto.value = colorHex;
            inputOculto.dispatchEvent(new Event('input')); 
        }
        
        // LA LÍNEA MÁGICA: Forzamos a que el cuadradito se pinte en vivo
        instance.applyColor(true); 
    });
});