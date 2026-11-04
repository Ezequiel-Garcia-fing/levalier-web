// ==========================================
// 1. NAVEGACIÓN Y MENÚ LATERAL
// ==========================================
const sidebar = document.getElementById('sidebar');
const btnMenu = document.getElementById('btn-menu');
const itemsMenu = document.querySelectorAll('.menu-item');
const modulosPrendas = document.querySelectorAll('.modulo-prenda');

function alternarMenu() {
    sidebar.classList.toggle('abierta');
    btnMenu.classList.toggle('btn-desplazado');
    
    if (sidebar.classList.contains('abierta')) {
        btnMenu.innerHTML = '&times; Cerrar';
        btnMenu.style.backgroundColor = 'var(--rojo-levalier)';
    } else {
        btnMenu.innerHTML = '☰ Prendas';
        btnMenu.style.backgroundColor = 'var(--azul-levalier)';
    }
}

if (btnMenu) btnMenu.addEventListener('click', alternarMenu);

itemsMenu.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        itemsMenu.forEach(i => i.classList.remove('activo'));
        item.classList.add('activo');

        modulosPrendas.forEach(modulo => modulo.classList.remove('activo'));
        const moduloObjetivo = item.getAttribute('data-target');
        document.getElementById(moduloObjetivo).classList.add('activo');

        if (sidebar.classList.contains('abierta')) alternarMenu();
        if (typeof actualizarEnlacesWhatsApp === 'function') actualizarEnlacesWhatsApp();
    });
});

// ==========================================
// 2. INICIALIZADOR UNIVERSAL DE COLORES (PICKR)
// ==========================================
const pickrActivos = {};

// Sincroniza visualmente el botón de Pickr para que muestre el color real y NUNCA se vea negro
function sincronizarBotonPickr(instance, colorHex) {
    if (!instance || !colorHex) return;
    try {
        let hex = colorHex.trim();
        if (hex.length === 9 && hex.startsWith('#')) hex = hex.substring(0, 7);
        instance.setColor(hex);
        instance.applyColor(true);
        const root = instance.getRoot();
        if (root && root.button) {
            root.button.style.setProperty('--pcr-color', hex);
            root.button.style.backgroundColor = hex;
        }
    } catch (e) {}
}

document.querySelectorAll('.pickr-contenedor').forEach(contenedor => {
    const targetId = contenedor.getAttribute('data-target');
    const colorPorDefecto = contenedor.getAttribute('data-default') || '#0C43B5';
    const inputOculto = document.getElementById(targetId);

    // Asegurar que el input oculto arranque con el valor correcto
    if (inputOculto && !inputOculto.value) {
        inputOculto.value = colorPorDefecto;
    }

    const pickr = Pickr.create({
        el: contenedor,
        theme: 'classic',
        default: colorPorDefecto,
        swatches: ['#ffffff', '#1a1e29', '#e32627', '#0C43B5', '#DD3939', '#f09433', '#25D366', '#000000'],
        components: {
            preview: true, opacity: false, hue: true, 
            interaction: { hex: true, input: true, clear: false, save: false }
        }
    });
    pickrActivos[targetId] = pickr;

    // Pintar el botón inmediatamente con el color por defecto (evita que se vea negro al inicio)
    pickr.on('init', inst => {
        sincronizarBotonPickr(inst, colorPorDefecto);
    });
    sincronizarBotonPickr(pickr, colorPorDefecto);

    pickr.on('change', (color, source, instance) => {
        const colorHex = color.toHEXA().toString();
        if (inputOculto) {
            inputOculto.value = colorHex;
            inputOculto.dispatchEvent(new Event('input')); 
        }
        sincronizarBotonPickr(instance, colorHex);
    });
});

// Función universal para cambiar el color de un selector tanto en el input como en la interfaz Pickr
function aplicarColorASelector(idInput, hexColor) {
    const input = document.getElementById(idInput);
    if (!input || !hexColor) return;
    let hex = hexColor.trim();
    if (hex.length === 9 && hex.startsWith('#')) {
        hex = hex.substring(0, 7); // Remueve canal alfa si viene en 8 dígitos
    }
    input.value = hex;
    input.dispatchEvent(new Event('input'));
    if (pickrActivos && pickrActivos[idInput]) {
        sincronizarBotonPickr(pickrActivos[idInput], hex);
    }
}

// ==========================================
// 3. FÁBRICA UNIVERSAL DE LIENZOS (Fabric.js)
// ==========================================
// Todos los lienzos activos se guardan en este diccionario
const canvasActivos = {};

function inicializarCanvas(idCanvas, idInputFile, idBtnEliminar, tamañoMaximo = 150) {
    if (!document.getElementById(idCanvas)) return null;

    const canvas = new fabric.Canvas(idCanvas);
    canvasActivos[idCanvas] = canvas;
    const btnEliminar = document.getElementById(idBtnEliminar);

    // Evento para subir imagen
    document.getElementById(idInputFile).addEventListener('change', function(e) {
        const archivo = e.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = function(evento) {
            fabric.Image.fromURL(evento.target.result, function(img) {
                if (img.width > tamañoMaximo) img.scaleToWidth(tamañoMaximo);
                
                img.set({
                    left: canvas.width / 2 - (img.width * img.scaleX) / 2, 
                    top: canvas.height / 2 - (img.height * img.scaleY) / 2,
                    cornerColor: '#0055ff', cornerStrokeColor: '#ffffff',
                    cornerSize: 12, transparentCorners: false
                });
                
                canvas.add(img);
                canvas.setActiveObject(img);
            });
        };
        lector.readAsDataURL(archivo);
        e.target.value = ''; 
    });

    // Control de visibilidad persistente y acción del botón eliminar logo
    if (btnEliminar) {
        const actualizarVisibilidadEliminar = () => {
            if (canvas.getObjects().length > 0) {
                btnEliminar.classList.remove('oculto');
            } else {
                btnEliminar.classList.add('oculto');
            }
        };

        const actualizarEstadoLienzo = () => {
            actualizarVisibilidadEliminar();
            if (typeof actualizarEnlacesWhatsApp === 'function') {
                actualizarEnlacesWhatsApp();
            }
        };

        canvas.on('object:added', actualizarEstadoLienzo);
        canvas.on('object:removed', actualizarEstadoLienzo);
        canvas.on('object:modified', actualizarEstadoLienzo);
        canvas.on('selection:created', actualizarVisibilidadEliminar);
        canvas.on('selection:updated', actualizarVisibilidadEliminar);
        canvas.on('selection:cleared', actualizarVisibilidadEliminar);

        btnEliminar.addEventListener('click', function() {
            let logoActivo = canvas.getActiveObject();
            if (!logoActivo && canvas.getObjects().length > 0) {
                const objs = canvas.getObjects();
                logoActivo = objs[objs.length - 1];
            }
            if (logoActivo) {
                canvas.remove(logoActivo);
                canvas.discardActiveObject();
                canvas.requestRenderAll();
            }
            actualizarEstadoLienzo();
        });
    }
    return canvas;
}

// Inicializamos todos los lienzos con una sola línea cada uno
inicializarCanvas('canvas-logos', 'subir-logo', 'btn-eliminar-logo-remera', 150);
inicializarCanvas('canvas-logos-pantalon', 'subir-logo-pantalon', 'btn-eliminar-logo-pantalon', 80);
inicializarCanvas('canvas-logos-musc', 'subir-logo-musc', 'btn-eliminar-logo-musc', 150);
inicializarCanvas('canvas-logos-medias', 'subir-logo-medias', 'btn-eliminar-logo-medias', 60);
inicializarCanvas('canvas-logos-gorras', 'subir-logo-gorra', 'btn-eliminar-logo-gorras', 90);
inicializarCanvas('canvas-logos-gorras-gabardina', 'subir-logo-gorra-gabardina', 'btn-eliminar-logo-gorras-gab', 90);

// Evento Global de Borrado con Teclado
window.addEventListener('keydown', function(e) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        Object.values(canvasActivos).forEach(canvas => {
            const objActivo = canvas.getActiveObject();
            if (objActivo && !objActivo.isEditing) {
                canvas.remove(objActivo);
                canvas.discardActiveObject();
                canvas.requestRenderAll();
            }
        });
    }
});

// Recalcular offsets de Fabric.js al redimensionar pantalla / cambiar de monitor
window.addEventListener('resize', () => {
    Object.values(canvasActivos).forEach(c => {
        if (c && c.calcOffset) c.calcOffset();
    });
});


// ==========================================
// 4. LÓGICAS ESPECÍFICAS POR PRENDA
// ==========================================

// --- REMERA: SISTEMA MODULAR DE DISEÑOS Y PATRONES ---
let modeloActualGlobal = 'liso'; 
const tarjetasModelo = document.querySelectorAll('.tarjeta-modelo');
const botonesCategoria = document.querySelectorAll('.btn-categoria-modelo');

const patronMitadFrente = document.getElementById('patron-mitad-frente');
const patronMitadEspalda = document.getElementById('patron-mitad-espalda');
const patronRayasFrente = document.getElementById('patron-rayas-frente');
const patronRayasEspalda = document.getElementById('patron-rayas-espalda');
const patronDegradado = document.getElementById('patron-degradado');
const patronSvg = document.getElementById('patron-svg');
const svgGrupoFranja = document.getElementById('svg-grupo-franja');
const svgFranjaPecho = document.getElementById('svg-franja-pecho');
const svgGrupoBanda = document.getElementById('svg-grupo-banda');
const svgBandaFrente = document.getElementById('svg-banda-frente');
const svgBandaEspalda = document.getElementById('svg-banda-espalda');
const svgGrupoChevron = document.getElementById('svg-grupo-chevron');
const svgChevronFrente = document.getElementById('svg-chevron-frente');
const svgChevronEspalda = document.getElementById('svg-chevron-espalda');

const svgGrupoTricolor = document.getElementById('svg-grupo-tricolor');
const svgTricolorBloqueFrente = document.getElementById('svg-tricolor-bloque-frente');
const svgTricolorBloqueEspalda = document.getElementById('svg-tricolor-bloque-espalda');
const svgTricolorBandaFrente = document.getElementById('svg-tricolor-banda-frente');
const svgTricolorBandaEspalda = document.getElementById('svg-tricolor-banda-espalda');
const svgTricolorSombraFrente = document.getElementById('svg-tricolor-sombra-frente');
const svgTricolorSombraEspalda = document.getElementById('svg-tricolor-sombra-espalda');

const svgTricolorLineasFrente = [
    document.getElementById('svg-tricolor-linea-frente-izq-1'),
    document.getElementById('svg-tricolor-linea-frente-izq-2'),
    document.getElementById('svg-tricolor-linea-frente-der-1'),
    document.getElementById('svg-tricolor-linea-frente-der-2')
];
const svgTricolorLineasEspalda = [
    document.getElementById('svg-tricolor-linea-espalda-izq-1'),
    document.getElementById('svg-tricolor-linea-espalda-izq-2'),
    document.getElementById('svg-tricolor-linea-espalda-der-1'),
    document.getElementById('svg-tricolor-linea-espalda-der-2')
];

const selectorColor3 = document.getElementById('selector-color-3');
const contenedorColor3 = document.getElementById('contenedor-color-3');
const labelColor3 = document.getElementById('label-color-3');
const controlesTricolor = document.getElementById('controles-tricolor');
const sliderTricolorAncho = document.getElementById('slider-tricolor-ancho');
const svgGrupoSplash = document.getElementById('svg-grupo-splash');
const controlesSplash = document.getElementById('controles-splash');
const sliderSplashAncho = document.getElementById('slider-splash-ancho');

const selectorCuerpo = document.getElementById('selector-cuerpo');
const selectorMangas = document.getElementById('selector-mangas');
const selectorPatron = document.getElementById('selector-patron');
const contenedorColor2 = document.getElementById('contenedor-color-2');
const contenedorSlider = document.getElementById('contenedor-slider'); 
const sliderMitad = document.getElementById('slider-mitad');
const sliderRayas = document.getElementById('slider-rayas');
const controlesFranja = document.getElementById('controles-franja');
const sliderFranjaPos = document.getElementById('slider-franja-pos');
const sliderFranjaGrosor = document.getElementById('slider-franja-grosor');
const sliderBanda = document.getElementById('slider-banda');
const controlesChevron = document.getElementById('controles-chevron');
const sliderChevronPos = document.getElementById('slider-chevron-pos');
const sliderChevronGrosor = document.getElementById('slider-chevron-grosor');
const sliderChevronAngulo = document.getElementById('slider-chevron-angulo');
const labelColor1 = document.getElementById('label-color-1');
const labelColor2 = document.getElementById('label-color-2');
const labelSlider = document.getElementById('label-slider');

// Registro Modular de Modelos
const CONFIG_MODELOS_REMERA = {
    'liso': {
        colores: 1,
        labelColor1: 'Color Principal:',
        coloresIniciales: {
            color1: '#0C43B5', // Azul Levalier
            mangas: '#7B7777'  // Mangas
        },
        activar: () => {}
    },
    'mitad': {
        colores: 2,
        labelColor1: 'Color Principal (Derecha):',
        labelColor2: 'Color Secundario (Izquierda):',
        sliderId: 'slider-mitad',
        labelSlider: 'Ajustar Centro del Corte:',
        coloresIniciales: {
            color1: '#0C43B5', // Azul Levalier
            color2: '#DD3939', // Rojo Levalier
            mangas: '#7B7777'
        },
        activar: () => {
            if (patronMitadFrente) patronMitadFrente.style.display = 'block';
            if (patronMitadEspalda) patronMitadEspalda.style.display = 'block';
        },
        actualizar: (colorSecundario) => {
            if (sliderMitad && patronMitadFrente && patronMitadEspalda) {
                const valorMitad = sliderMitad.value;
                patronMitadFrente.style.backgroundColor = colorSecundario;
                patronMitadEspalda.style.backgroundColor = colorSecundario;
                patronMitadFrente.style.width = valorMitad + '%';
                patronMitadEspalda.style.width = valorMitad + '%';
            }
        }
    },
    'rayas': {
        colores: 2,
        labelColor1: 'Color Base:',
        labelColor2: 'Color de Rayas:',
        sliderId: 'slider-rayas',
        labelSlider: 'Grosor de las Rayas:',
        coloresIniciales: {
            color1: '#0C43B5', // Azul Levalier
            color2: '#DD3939', // Rojo Levalier
            mangas: '#7B7777'
        },
        activar: () => {
            if (patronRayasFrente) patronRayasFrente.style.display = 'block';
            if (patronRayasEspalda) patronRayasEspalda.style.display = 'block';
        },
        actualizar: (colorSecundario) => {
            if (sliderRayas && patronRayasFrente && patronRayasEspalda) {
                const anchoRaya = sliderRayas.value;
                const gradiente = `repeating-linear-gradient(to right, transparent, transparent ${anchoRaya}%, ${colorSecundario} ${anchoRaya}%, ${colorSecundario} ${anchoRaya * 2}%)`;
                patronRayasFrente.style.background = gradiente;
                patronRayasEspalda.style.background = gradiente;
            }
        }
    },
    'degradado': {
        colores: 2,
        labelColor1: 'Color Superior (Arriba):',
        labelColor2: 'Color Inferior (Abajo):',
        coloresIniciales: {
            color1: '#0C43B5', // Azul Levalier
            color2: '#DD3939', // Rojo Levalier
            mangas: '#7B7777'
        },
        activar: () => {
            if (patronDegradado) patronDegradado.style.display = 'block';
        },
        actualizar: (colorSecundario) => {
            if (patronDegradado) {
                const colorSuperior = selectorCuerpo ? selectorCuerpo.value : '#0C43B5';
                patronDegradado.style.background = `linear-gradient(to bottom, ${colorSuperior} 12%, ${colorSecundario} 88%)`;
            }
        }
    },
    'franja': {
        colores: 2,
        labelColor1: 'Color Base:',
        labelColor2: 'Color de Franja:',
        controlesFranja: true,
        coloresIniciales: {
            color1: '#0C43B5', // Azul Levalier
            color2: '#DD3939', // Rojo Levalier
            mangas: '#7B7777'
        },
        activar: () => {
            if (patronSvg) patronSvg.style.display = 'block';
            if (svgGrupoFranja) svgGrupoFranja.style.display = 'block';
        },
        actualizar: (colorSecundario) => {
            if (svgFranjaPecho) {
                svgFranjaPecho.setAttribute('fill', colorSecundario);
                const y = sliderFranjaPos ? parseFloat(sliderFranjaPos.value) : 215;
                const grosor = sliderFranjaGrosor ? parseFloat(sliderFranjaGrosor.value) : 85;
                svgFranjaPecho.setAttribute('y', y);
                svgFranjaPecho.setAttribute('height', grosor);
            }
        }
    },
    'banda': {
        colores: 2,
        labelColor1: 'Color Base:',
        labelColor2: 'Color de Banda:',
        sliderId: 'slider-banda',
        labelSlider: 'Ancho de la Banda:',
        coloresIniciales: {
            color1: '#0C43B5', // Azul Levalier
            color2: '#DD3939', // Rojo Levalier
            mangas: '#7B7777'
        },
        activar: () => {
            if (patronSvg) patronSvg.style.display = 'block';
            if (svgGrupoBanda) svgGrupoBanda.style.display = 'block';
        },
        actualizar: (colorSecundario) => {
            if (svgBandaFrente && svgBandaEspalda) {
                svgBandaFrente.setAttribute('fill', colorSecundario);
                svgBandaEspalda.setAttribute('fill', colorSecundario);

                // ========================================================
                // PARÁMETROS DE GEOMETRÍA DE LA BANDA DIAGONAL (RIVER)
                // ========================================================
                // FRENTE (hombro izquierdo del jugador hacia cadera derecha):
                const frenteHombroX = 330;   // Inicio en hombro (aumentar = hacia manga, reducir = hacia cuello)
                const frenteCaderaX = 100;   // Llegada en cadera (reducir = más inclinada, aumentar = más vertical)
                const frenteTopY    = 40;    // Altura superior (hombro)
                const frenteBottomY = 460;   // Altura inferior (cintura)

                // ESPALDA (simétrica con continuidad anatómica):
                const espaldaHombroX = 470;  // Inicio en hombro espalda (reducir = hacia cuello, aumentar = hacia manga)
                const espaldaCaderaX = 690;  // Llegada en cadera espalda (aumentar = más inclinada, reducir = más vertical)
                const espaldaTopY    = 40;   // Altura superior espalda
                const espaldaBottomY = 460;  // Altura inferior espalda

                // ANCHO DINÁMICO (controlado por slider interactivo):
                const ancho = sliderBanda ? parseFloat(sliderBanda.value) : 65;
                const w = ancho / 2;

                svgBandaFrente.setAttribute('points', `${frenteHombroX - w},${frenteTopY} ${frenteHombroX + w},${frenteTopY} ${frenteCaderaX + w},${frenteBottomY} ${frenteCaderaX - w},${frenteBottomY}`);
                svgBandaEspalda.setAttribute('points', `${espaldaHombroX - w},${espaldaTopY} ${espaldaHombroX + w},${espaldaTopY} ${espaldaCaderaX + w},${espaldaBottomY} ${espaldaCaderaX - w},${espaldaBottomY}`);
            }
        }
    },
    'chevron': {
        colores: 2,
        labelColor1: 'Color Base:',
        labelColor2: 'Color del Chevron:',
        controlesChevron: true,
        coloresIniciales: {
            color1: '#0C43B5', // Azul Levalier
            color2: '#DD3939', // Rojo Levalier
            mangas: '#7B7777'
        },
        activar: () => {
            if (patronSvg) patronSvg.style.display = 'block';
            if (svgGrupoChevron) svgGrupoChevron.style.display = 'block';
        },
        actualizar: (colorSecundario) => {
            if (svgChevronFrente && svgChevronEspalda) {
                svgChevronFrente.setAttribute('fill', colorSecundario);
                svgChevronEspalda.setAttribute('fill', colorSecundario);

                // ========================================================
                // PARÁMETROS DE CENTRADO Y GEOMETRÍA DEL CHEVRON EN "V" NO TOCAR ESTOS PARAMETROS NUNCA
                // ========================================================
                const centroFrente = 210;   // <-- Centro Frente (calibrado por el usuario)
                const centroEspalda = 589;  // <-- Centro Espalda (calibrado por el usuario)
                const apertura = 220;       // Separación horizontal prolongada para abarcar 100% el ancho de frente y espalda

                // Parámetros interactivos controlados por los sliders para los clientes:
                const y = sliderChevronPos ? parseFloat(sliderChevronPos.value) : 160;
                const grosor = sliderChevronGrosor ? parseFloat(sliderChevronGrosor.value) : 75;
                // Factor de prolongación para mantener la misma inclinación proporcional a lo ancho de la remera
                const factorProlongacion = apertura / 122;
                const inclinacion = (sliderChevronAngulo ? parseFloat(sliderChevronAngulo.value) : 70) * factorProlongacion;

                const yTop = y - inclinacion;
                const yTop2 = yTop + grosor;
                const yApex2 = y + grosor;

                const xIzqFrente = centroFrente - apertura;
                const xDerFrente = centroFrente + apertura;
                const xIzqEspalda = centroEspalda - apertura;
                const xDerEspalda = centroEspalda + apertura;

                svgChevronFrente.setAttribute('points', `${xIzqFrente.toFixed(1)},${yTop.toFixed(1)} ${centroFrente},${y} ${xDerFrente.toFixed(1)},${yTop.toFixed(1)} ${xDerFrente.toFixed(1)},${yTop2.toFixed(1)} ${centroFrente},${yApex2} ${xIzqFrente.toFixed(1)},${yTop2.toFixed(1)}`);
                svgChevronEspalda.setAttribute('points', `${xIzqEspalda.toFixed(1)},${yTop.toFixed(1)} ${centroEspalda},${y} ${xDerEspalda.toFixed(1)},${yTop.toFixed(1)} ${xDerEspalda.toFixed(1)},${yTop2.toFixed(1)} ${centroEspalda},${yApex2} ${xIzqEspalda.toFixed(1)},${yTop2.toFixed(1)}`);
            }
        }
    },
    'tricolor-dynamic': {
        colores: 3,
        labelColor1: 'Color Bloque Superior:',
        labelColor2: 'Color Banda Central:',
        labelColor3: 'Color Bloque Inferior:',
        controlesTricolor: true,
        coloresIniciales: {
            color1: '#0C43B5',
            color2: '#FFFFFF',
            color3: '#E32627'
        },
        activar: () => {
            if (patronSvg) patronSvg.style.display = 'block';
            if (svgGrupoTricolor) svgGrupoTricolor.style.display = 'block';
        },
        actualizar: (colorSecundario) => {
            const colorTerciario = selectorColor3 ? selectorColor3.value : '#E32627';
            const colorBanda = colorSecundario; // Color 2

            // ========================================================
            // PARÁMETROS DE GEOMETRÍA: TRICOLOR DYNAMIC
            // (Modifica estos valores para variar la inclinación y proporciones)
            // ========================================================
            // 1. FRENTE (hombro izquierdo del jugador hacia cadera derecha):
            const frenteTopX = 335;       // Inicio en hombro (aumentar = hacia manga, reducir = hacia cuello)
            const frenteBottomX = 80;     // Salida en cadera (aumentar = más vertical, reducir = más inclinada)

            // 2. ESPALDA (continuidad anatómica con el frente):
            const espaldaTopX = 465;      // Inicio en hombro espalda (conecta con el frente)
            const espaldaBottomX = 720;   // Salida en cadera espalda

            // 3. ANCHO DE LA BANDA DIAGONAL (controlado por slider interactivo):
            const ancho = sliderTricolorAncho ? parseFloat(sliderTricolorAncho.value) : 130;
            const w = ancho / 2;

            // 4. LÍNEAS FINAS DE ACENTO (PINSTRIPES PARALELAS):
            const distLinea1 = 28;        // Distancia de la 1° línea fina respecto al borde de la banda
            const distLinea2 = 52;        // Distancia de la 2° línea fina respecto al borde de la banda

            // 5. LÍMITES VERTICALES DEL LIENZO:
            const topY = 20;              // Límite superior
            const bottomY = 480;          // Límite inferior

            // --- APLICACIÓN DE COLORES ---
            if (svgTricolorBandaFrente) svgTricolorBandaFrente.setAttribute('fill', colorBanda);
            if (svgTricolorBandaEspalda) svgTricolorBandaEspalda.setAttribute('fill', colorBanda);
            if (svgTricolorBloqueFrente) svgTricolorBloqueFrente.setAttribute('fill', colorTerciario);
            if (svgTricolorBloqueEspalda) svgTricolorBloqueEspalda.setAttribute('fill', colorTerciario);

            // --- CÁLCULO DE COORDENADAS FRENTE ---
            const fTopIzq = frenteTopX - w;
            const fTopDer = frenteTopX + w;
            const fBotIzq = frenteBottomX - w;
            const fBotDer = frenteBottomX + w;

            if (svgTricolorBandaFrente) {
                svgTricolorBandaFrente.setAttribute('points', `${fTopIzq},${topY} ${fTopDer},${topY} ${fBotDer},${bottomY} ${fBotIzq},${bottomY}`);
            }
            if (svgTricolorSombraFrente) {
                svgTricolorSombraFrente.setAttribute('points', `${fTopIzq},${topY} ${fTopDer},${topY} ${fBotDer},${bottomY} ${fBotIzq},${bottomY}`);
            }
            if (svgTricolorBloqueFrente) {
                svgTricolorBloqueFrente.setAttribute('points', `${fTopDer},${topY} 400,${topY} 400,${bottomY} ${fBotDer},${bottomY}`);
            }

            // Líneas finas Frente (lado azul):
            if (svgTricolorLineasFrente[0]) {
                svgTricolorLineasFrente[0].setAttribute('x1', fTopIzq - distLinea1);
                svgTricolorLineasFrente[0].setAttribute('y1', topY);
                svgTricolorLineasFrente[0].setAttribute('x2', fBotIzq - distLinea1);
                svgTricolorLineasFrente[0].setAttribute('y2', bottomY);
                svgTricolorLineasFrente[0].setAttribute('stroke', colorBanda);
            }
            if (svgTricolorLineasFrente[1]) {
                svgTricolorLineasFrente[1].setAttribute('x1', fTopIzq - distLinea2);
                svgTricolorLineasFrente[1].setAttribute('y1', topY);
                svgTricolorLineasFrente[1].setAttribute('x2', fBotIzq - distLinea2);
                svgTricolorLineasFrente[1].setAttribute('y2', bottomY);
                svgTricolorLineasFrente[1].setAttribute('stroke', colorBanda);
            }
            // Líneas finas Frente (lado rojo):
            if (svgTricolorLineasFrente[2]) {
                svgTricolorLineasFrente[2].setAttribute('x1', fTopDer + distLinea1);
                svgTricolorLineasFrente[2].setAttribute('y1', topY);
                svgTricolorLineasFrente[2].setAttribute('x2', fBotDer + distLinea1);
                svgTricolorLineasFrente[2].setAttribute('y2', bottomY);
                svgTricolorLineasFrente[2].setAttribute('stroke', colorBanda);
            }
            if (svgTricolorLineasFrente[3]) {
                svgTricolorLineasFrente[3].setAttribute('x1', fTopDer + distLinea2);
                svgTricolorLineasFrente[3].setAttribute('y1', topY);
                svgTricolorLineasFrente[3].setAttribute('x2', fBotDer + distLinea2);
                svgTricolorLineasFrente[3].setAttribute('y2', bottomY);
                svgTricolorLineasFrente[3].setAttribute('stroke', colorBanda);
            }

            // --- CÁLCULO DE COORDENADAS ESPALDA ---
            const eTopIzq = espaldaTopX - w;
            const eTopDer = espaldaTopX + w;
            const eBotIzq = espaldaBottomX - w;
            const eBotDer = espaldaBottomX + w;

            if (svgTricolorBandaEspalda) {
                svgTricolorBandaEspalda.setAttribute('points', `${eTopIzq},${topY} ${eTopDer},${topY} ${eBotDer},${bottomY} ${eBotIzq},${bottomY}`);
            }
            if (svgTricolorSombraEspalda) {
                svgTricolorSombraEspalda.setAttribute('points', `${eTopIzq},${topY} ${eTopDer},${topY} ${eBotDer},${bottomY} ${eBotIzq},${bottomY}`);
            }
            if (svgTricolorBloqueEspalda) {
                svgTricolorBloqueEspalda.setAttribute('points', `400,${topY} ${eTopIzq},${topY} ${eBotIzq},${bottomY} 400,${bottomY}`);
            }

            // Líneas finas Espalda (lado rojo):
            if (svgTricolorLineasEspalda[0]) {
                svgTricolorLineasEspalda[0].setAttribute('x1', eTopIzq - distLinea1);
                svgTricolorLineasEspalda[0].setAttribute('y1', topY);
                svgTricolorLineasEspalda[0].setAttribute('x2', eBotIzq - distLinea1);
                svgTricolorLineasEspalda[0].setAttribute('y2', bottomY);
                svgTricolorLineasEspalda[0].setAttribute('stroke', colorBanda);
            }
            if (svgTricolorLineasEspalda[1]) {
                svgTricolorLineasEspalda[1].setAttribute('x1', eTopIzq - distLinea2);
                svgTricolorLineasEspalda[1].setAttribute('y1', topY);
                svgTricolorLineasEspalda[1].setAttribute('x2', eBotIzq - distLinea2);
                svgTricolorLineasEspalda[1].setAttribute('y2', bottomY);
                svgTricolorLineasEspalda[1].setAttribute('stroke', colorBanda);
            }
            // Líneas finas Espalda (lado azul):
            if (svgTricolorLineasEspalda[2]) {
                svgTricolorLineasEspalda[2].setAttribute('x1', eTopDer + distLinea1);
                svgTricolorLineasEspalda[2].setAttribute('y1', topY);
                svgTricolorLineasEspalda[2].setAttribute('x2', eBotDer + distLinea1);
                svgTricolorLineasEspalda[2].setAttribute('y2', bottomY);
                svgTricolorLineasEspalda[2].setAttribute('stroke', colorBanda);
            }
            if (svgTricolorLineasEspalda[3]) {
                svgTricolorLineasEspalda[3].setAttribute('x1', eTopDer + distLinea2);
                svgTricolorLineasEspalda[3].setAttribute('y1', topY);
                svgTricolorLineasEspalda[3].setAttribute('x2', eBotDer + distLinea2);
                svgTricolorLineasEspalda[3].setAttribute('y2', bottomY);
                svgTricolorLineasEspalda[3].setAttribute('stroke', colorBanda);
            }
        }
    },
    'dynamic-splash': {
        colores: 3,
        labelColor1: 'Color Pecho (Superior):',
        labelColor2: 'Color Pincelada Central:',
        labelColor3: 'Color Base / Inferior:',
        controlesSplash: true,
        // ========================================================
        // COLORES INICIALES POR DEFECTO PARA DYNAMIC SPLASH:
        // (Modificá acá directamente los colores con los que arranca el modelo)
        // ========================================================
        coloresIniciales: {
            color1: '#d1cece45', // Pecho superior (Color Principal)
            color2: '#D8224E', // Pincelada central (Color Secundario)
            color3: '#142936', // Base / Cintura / Salpicaduras (Tercer Color)
            mangas: '#142936'  // Mangas (opcional)
        },
        activar: () => {
            if (patronSvg) patronSvg.style.display = 'block';
            if (svgGrupoSplash) svgGrupoSplash.style.display = 'block';
        },
        actualizar: (colorSecundario) => {
            const color1 = selectorCuerpo ? selectorCuerpo.value : '#FFFFFF';
            const color2 = colorSecundario; // Color Pincelada Central
            const color3 = selectorColor3 ? selectorColor3.value : '#142936';

            // ========================================================
            // PARÁMETROS DE GEOMETRÍA: DYNAMIC SPLASH (PINCELADAS)
            // (Modifica estos valores para variar la inclinación y proporciones)
            // ========================================================
            // 1. FRENTE (hombro hacia cadera opuesta):
            const frenteInicioX = 100;    // Inicio en hombro (aumentar = hacia el centro, reducir = hacia manga)
            const frenteInicioY = 30;     // Altura superior
            const frenteFinX    = 400;    // Llegada en cadera (aumentar = más inclinada, reducir = más vertical)
            const frenteFinY    = 530;    // Altura inferior

            // 2. ESPALDA (continuidad anatómica con el frente):
            const espaldaInicioX = 695;   // Inicio en hombro espalda
            const espaldaInicioY = 30;
            const espaldaFinX    = 400;   // Llegada en cadera espalda
            const espaldaFinY    = 530;

            // 3. ANCHO DEL CUERPO DE LA PINCELADA (controlado por slider interactivo):
            const ancho = sliderSplashAncho ? parseFloat(sliderSplashAncho.value) : 85;

            // 4. LARGO DE LAS CERDAS DESHILACHADAS (Dry Brush):
            const largoCerdas = 40;

            if (svgGrupoSplash) {
                function generarLado(x1, y1, x2, y2, bAncho, lCerdas, c1, c2, c3, esEspalda) {
                    const dx = x2 - x1, dy = y2 - y1;
                    const L = Math.hypot(dx, dy);
                    const ux = dx / L, uy = dy / L;
                    const nx = esEspalda ? uy : -uy;
                    const ny = esEspalda ? -ux : ux;
                    const w2 = bAncho / 2;

                    const svg = [];

                    // 1. Bloque Pecho (Color 1)
                    if (esEspalda) {
                        svg.push(`<polygon points="400,0 600,0 560,260 400,380" fill="${c1}" />`);
                    } else {
                        svg.push(`<polygon points="200,0 400,0 400,380 240,260" fill="${c1}" />`);
                    }

                    // 2. Bloque Inferior / Cintura (Color 3)
                    if (esEspalda) {
                        svg.push(`<polygon points="400,380 400,500 800,500 800,180 580,280" fill="${c3}" />`);
                    } else {
                        svg.push(`<polygon points="0,180 0,500 400,500 400,380 220,280" fill="${c3}" />`);
                    }

                    // 3. Banda Central Sólida (Color 2)
                    const p1 = `${(x1 - w2*nx).toFixed(1)},${(y1 - w2*ny).toFixed(1)}`;
                    const p2 = `${(x1 + w2*nx).toFixed(1)},${(y1 + w2*ny).toFixed(1)}`;
                    const p3 = `${(x2 + w2*nx).toFixed(1)},${(y2 + w2*ny).toFixed(1)}`;
                    const p4 = `${(x2 - w2*nx).toFixed(1)},${(y2 - w2*ny).toFixed(1)}`;
                    svg.push(`<polygon points="${p1} ${p2} ${p3} ${p4}" fill="${c2}" />`);

                    // 4. Haces de cerdas rojas deshilachadas (Dry Brush)
                    const cerdas = [
                        [0.04, 1.2, 7, -1], [0.09, 0.7, 5, -1], [0.14, 1.5, 9, -1], [0.20, 0.9, 6, -1],
                        [0.26, 1.7, 11, -1], [0.33, 1.1, 7, -1], [0.40, 1.9, 13, -1], [0.47, 0.8, 6, -1],
                        [0.54, 1.6, 10, -1], [0.62, 1.2, 8, -1], [0.70, 1.8, 12, -1], [0.79, 0.9, 6, -1],
                        [0.87, 1.4, 9, -1], [0.94, 0.7, 5, -1],
                        [0.06, 0.9, 6, 1], [0.12, 1.4, 10, 1], [0.18, 0.8, 5, 1], [0.25, 1.6, 12, 1],
                        [0.32, 1.0, 7, 1], [0.39, 1.8, 12, 1], [0.46, 0.7, 5, 1], [0.53, 1.5, 10, 1],
                        [0.60, 1.1, 7, 1], [0.68, 1.7, 11, 1], [0.76, 0.8, 6, 1], [0.84, 1.4, 9, 1],
                        [0.91, 1.0, 6, 1]
                    ];
                    for (let i = 0; i < cerdas.length; i++) {
                        const [t, lenFac, bW, side] = cerdas[i];
                        const bx = x1 + t * dx + (side * w2) * nx;
                        const by = y1 + t * dy + (side * w2) * ny;
                        const l = lCerdas * lenFac;
                        const tx = bx + (side * 0.35 * nx + 0.92 * ux) * l;
                        const ty = by + (side * 0.35 * ny + 0.92 * uy) * l;
                        const pb1 = `${(bx - (bW/2)*ux).toFixed(1)},${(by - (bW/2)*uy).toFixed(1)}`;
                        const pb2 = `${(bx + (bW/2)*ux).toFixed(1)},${(by + (bW/2)*uy).toFixed(1)}`;
                        svg.push(`<polygon points="${pb1} ${tx.toFixed(1)},${ty.toFixed(1)} ${pb2}" fill="${c2}" />`);
                    }

                    // 5. Salpicaduras y líneas voladoras desprendidas (Color 2)
                    const voladoras = [
                        [0.16, 60, 4, -36], [0.30, 85, 5, -46], [0.45, 100, 6, -52], [0.65, 75, 4, -40],
                        [0.12, 55, 4, 34],  [0.35, 90, 5, 45],  [0.50, 105, 6, 55],  [0.72, 70, 4, 38]
                    ];
                    for (let i = 0; i < voladoras.length; i++) {
                        const [t, l, w, offset] = voladoras[i];
                        const sgn = offset < 0 ? -1 : 1;
                        const bx = x1 + t * dx + (sgn * w2 + offset) * nx;
                        const by = y1 + t * dy + (sgn * w2 + offset) * ny;
                        const tx = bx + ux * l;
                        const ty = by + uy * l;
                        svg.push(`<polygon points="${(bx - w*nx).toFixed(1)},${(by - w*ny).toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)} ${(bx + w*nx).toFixed(1)},${(by + w*ny).toFixed(1)} ${(tx - ux*3).toFixed(1)},${(ty - uy*3).toFixed(1)}" fill="${c2}" opacity="0.9" />`);
                    }

                    // 6. Salpicaduras Oscuras cortantes (Color 3)
                    const cortesOscuros = [
                        [0.22, 90, 5, -12], [0.42, 120, 6, -4], [0.60, 105, 5, 8], [0.78, 90, 4, -8],
                        [0.10, 70, 4, -55], [0.28, 85, 5, -65], [0.48, 95, 5, -70]
                    ];
                    for (let i = 0; i < cortesOscuros.length; i++) {
                        const [t, l, w, offset] = cortesOscuros[i];
                        const bx = x1 + t * dx + offset * nx;
                        const by = y1 + t * dy + offset * ny;
                        const tx = bx + ux * l;
                        const ty = by + uy * l;
                        svg.push(`<polygon points="${(bx - w*nx).toFixed(1)},${(by - w*ny).toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)} ${(bx + w*nx).toFixed(1)},${(by + w*ny).toFixed(1)}" fill="${c3}" />`);
                    }

                    // 7. Salpicaduras Blancas sobre zona oscura (Color 1)
                    const blancas = [
                        [0.15, 65, 3.5, 30], [0.38, 80, 4, 42], [0.58, 90, 4, 48], [0.75, 65, 3.5, 35]
                    ];
                    for (let i = 0; i < blancas.length; i++) {
                        const [t, l, w, offset] = blancas[i];
                        const bx = x1 + t * dx + (w2 + offset) * nx;
                        const by = y1 + t * dy + (w2 + offset) * ny;
                        const tx = bx + ux * l;
                        const ty = by + uy * l;
                        svg.push(`<polygon points="${(bx - w*nx).toFixed(1)},${(by - w*ny).toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)} ${(bx + w*nx).toFixed(1)},${(by + w*ny).toFixed(1)}" fill="${c1}" opacity="0.85" />`);
                    }

                    return svg.join('\n');
                }

                const markupFrente = generarLado(frenteInicioX, frenteInicioY, frenteFinX, frenteFinY, ancho, largoCerdas, color1, color2, color3, false);
                const markupEspalda = generarLado(espaldaInicioX, espaldaInicioY, espaldaFinX, espaldaFinY, ancho, largoCerdas, color1, color2, color3, true);
                svgGrupoSplash.innerHTML = markupFrente + '\n' + markupEspalda;
            }
        }
    }
};

function actualizarPatrones() {
    if (!selectorPatron) return;
    const config = CONFIG_MODELOS_REMERA[modeloActualGlobal];
    if (config && config.actualizar) {
        config.actualizar(selectorPatron.value);
    }
    if (typeof actualizarEnlacesWhatsApp === 'function') {
        actualizarEnlacesWhatsApp();
    }
}

function seleccionarModelo(modeloId) {
    const config = CONFIG_MODELOS_REMERA[modeloId];
    if (!config) return;
    modeloActualGlobal = modeloId;

    // Aplicar colores iniciales definidos para el modelo si existen
    if (config.coloresIniciales) {
        if (config.coloresIniciales.color1) aplicarColorASelector('selector-cuerpo', config.coloresIniciales.color1);
        if (config.coloresIniciales.color2) aplicarColorASelector('selector-patron', config.coloresIniciales.color2);
        if (config.coloresIniciales.color3) aplicarColorASelector('selector-color-3', config.coloresIniciales.color3);
        if (config.coloresIniciales.mangas) aplicarColorASelector('selector-mangas', config.coloresIniciales.mangas);
    }

    // 1. Ocultar todos los patrones
    if (patronMitadFrente) patronMitadFrente.style.display = 'none';
    if (patronMitadEspalda) patronMitadEspalda.style.display = 'none';
    if (patronRayasFrente) patronRayasFrente.style.display = 'none';
    if (patronRayasEspalda) patronRayasEspalda.style.display = 'none';
    if (patronDegradado) patronDegradado.style.display = 'none';
    if (patronSvg) patronSvg.style.display = 'none';
    if (svgGrupoFranja) svgGrupoFranja.style.display = 'none';
    if (svgGrupoBanda) svgGrupoBanda.style.display = 'none';
    if (svgGrupoChevron) svgGrupoChevron.style.display = 'none';
    if (svgGrupoTricolor) svgGrupoTricolor.style.display = 'none';
    if (svgGrupoSplash) svgGrupoSplash.style.display = 'none';

    // 2. Ocultar todos los sliders
    if (sliderMitad) sliderMitad.classList.add('oculto');
    if (sliderRayas) sliderRayas.classList.add('oculto');
    if (sliderBanda) sliderBanda.classList.add('oculto');

    // 3. Configurar selector de color 1
    if (labelColor1) labelColor1.innerText = config.labelColor1 || 'Color Principal:';

    // 4. Configurar selectores de color 2 y 3
    if (config.colores >= 2) {
        if (contenedorColor2) contenedorColor2.classList.remove('oculto');
        if (labelColor2 && config.labelColor2) labelColor2.innerText = config.labelColor2;
    } else {
        if (contenedorColor2) contenedorColor2.classList.add('oculto');
    }

    if (config.colores >= 3) {
        if (contenedorColor3) contenedorColor3.classList.remove('oculto');
        if (labelColor3 && config.labelColor3) labelColor3.innerText = config.labelColor3;
    } else {
        if (contenedorColor3) contenedorColor3.classList.add('oculto');
    }

    // 5. Configurar sliders (específico para Franja, Chevron, Tricolor, Splash o slider único)
    if (config.controlesFranja) {
        if (contenedorSlider) contenedorSlider.classList.add('oculto');
        if (controlesChevron) controlesChevron.classList.add('oculto');
        if (controlesTricolor) controlesTricolor.classList.add('oculto');
        if (controlesSplash) controlesSplash.classList.add('oculto');
        if (controlesFranja) controlesFranja.classList.remove('oculto');
    } else if (config.controlesChevron) {
        if (contenedorSlider) contenedorSlider.classList.add('oculto');
        if (controlesFranja) controlesFranja.classList.add('oculto');
        if (controlesTricolor) controlesTricolor.classList.add('oculto');
        if (controlesSplash) controlesSplash.classList.add('oculto');
        if (controlesChevron) controlesChevron.classList.remove('oculto');
    } else if (config.controlesTricolor) {
        if (contenedorSlider) contenedorSlider.classList.add('oculto');
        if (controlesFranja) controlesFranja.classList.add('oculto');
        if (controlesChevron) controlesChevron.classList.add('oculto');
        if (controlesSplash) controlesSplash.classList.add('oculto');
        if (controlesTricolor) controlesTricolor.classList.remove('oculto');
    } else if (config.controlesSplash) {
        if (contenedorSlider) contenedorSlider.classList.add('oculto');
        if (controlesFranja) controlesFranja.classList.add('oculto');
        if (controlesChevron) controlesChevron.classList.add('oculto');
        if (controlesTricolor) controlesTricolor.classList.add('oculto');
        if (controlesSplash) controlesSplash.classList.remove('oculto');
    } else {
        if (controlesFranja) controlesFranja.classList.add('oculto');
        if (controlesChevron) controlesChevron.classList.add('oculto');
        if (controlesTricolor) controlesTricolor.classList.add('oculto');
        if (controlesSplash) controlesSplash.classList.add('oculto');
        if (config.sliderId) {
            if (contenedorSlider) contenedorSlider.classList.remove('oculto');
            const activeSlider = document.getElementById(config.sliderId);
            if (activeSlider) activeSlider.classList.remove('oculto');
            if (labelSlider && config.labelSlider) labelSlider.innerText = config.labelSlider;
        } else {
            if (contenedorSlider) contenedorSlider.classList.add('oculto');
        }
    }

    // 6. Activar modelo y refrescar
    if (config.activar) config.activar();
    actualizarPatrones();
    actualizarBotonDropdownEstilo(modeloId);
}

// Actualiza el botón compacto del dropdown de estilos
function actualizarBotonDropdownEstilo(modeloId) {
    const tarjeta = document.querySelector(`.tarjeta-modelo[data-modelo="${modeloId}"]`);
    if (!tarjeta) return;
    const img = tarjeta.querySelector('img');
    const span = tarjeta.querySelector('span');
    const btnDropdown = document.getElementById('btn-dropdown-estilo-remera');
    if (btnDropdown) {
        const thumb = btnDropdown.querySelector('.thumb-estilo-actual');
        const nombre = btnDropdown.querySelector('.nombre-estilo-actual');
        if (thumb && img) thumb.src = img.src;
        if (nombre && span) nombre.textContent = span.textContent;
    }
    // Cerrar el menú flotante
    document.querySelectorAll('.menu-desplegable-estilos').forEach(m => m.classList.add('oculto'));
    document.querySelectorAll('.btn-dropdown-estilo').forEach(b => b.classList.remove('abierto'));
}

// Eventos de selección de tarjetas
tarjetasModelo.forEach(tarjeta => {
    tarjeta.addEventListener('click', () => {
        tarjetasModelo.forEach(t => t.classList.remove('activa'));
        tarjeta.classList.add('activa');
        const modelo = tarjeta.getAttribute('data-modelo');
        seleccionarModelo(modelo);
    });
});

// Manejador del botón desplegable de estilos
document.querySelectorAll('.btn-dropdown-estilo').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wrapper = btn.closest('.dropdown-estilo-wrapper');
        const menu = wrapper ? wrapper.querySelector('.menu-desplegable-estilos') : null;
        if (menu) {
            const estaAbierto = !menu.classList.contains('oculto');
            document.querySelectorAll('.menu-desplegable-estilos').forEach(m => m.classList.add('oculto'));
            document.querySelectorAll('.btn-dropdown-estilo').forEach(b => b.classList.remove('abierto'));
            if (!estaAbierto) {
                menu.classList.remove('oculto');
                btn.classList.add('abierto');
            }
        }
    });
});

// Cerrar el dropdown al hacer clic fuera de él
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-estilo-wrapper')) {
        document.querySelectorAll('.menu-desplegable-estilos').forEach(m => m.classList.add('oculto'));
        document.querySelectorAll('.btn-dropdown-estilo').forEach(b => b.classList.remove('abierto'));
    }
});

// Manejador de pestañas del panel de herramientas (Prenda & Colores / Estampados & Logos)
document.querySelectorAll('.tab-btn-herramientas').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        const panel = btn.closest('.panel-herramientas');
        if (!panel) return;
        panel.querySelectorAll('.tab-btn-herramientas').forEach(b => b.classList.remove('activo'));
        panel.querySelectorAll('.tab-contenido-herramientas').forEach(c => c.classList.remove('activo'));
        btn.classList.add('activo');
        const targetContent = panel.querySelector('#' + targetId);
        if (targetContent) targetContent.classList.add('activo');
    });
});

// Eventos de filtrado por categoría
botonesCategoria.forEach(btn => {
    btn.addEventListener('click', () => {
        botonesCategoria.forEach(b => b.classList.remove('activo'));
        btn.classList.add('activo');
        const categoria = btn.getAttribute('data-categoria');

        tarjetasModelo.forEach(tarjeta => {
            const cat = tarjeta.getAttribute('data-categoria') || 'basicos';
            if (categoria === 'todos' || cat === categoria) {
                tarjeta.classList.remove('oculto');
            } else {
                tarjeta.classList.add('oculto');
            }
        });
    });
});

// Escucha de cambios de color y sliders
if (selectorPatron) selectorPatron.addEventListener('input', actualizarPatrones);
if (sliderMitad) sliderMitad.addEventListener('input', actualizarPatrones);
if (sliderRayas) sliderRayas.addEventListener('input', actualizarPatrones);
if (sliderFranjaPos) sliderFranjaPos.addEventListener('input', actualizarPatrones);
if (sliderFranjaGrosor) sliderFranjaGrosor.addEventListener('input', actualizarPatrones);
if (sliderBanda) sliderBanda.addEventListener('input', actualizarPatrones);
if (sliderChevronPos) sliderChevronPos.addEventListener('input', actualizarPatrones);
if (sliderChevronGrosor) sliderChevronGrosor.addEventListener('input', actualizarPatrones);
if (sliderChevronAngulo) sliderChevronAngulo.addEventListener('input', actualizarPatrones);
if (selectorColor3) selectorColor3.addEventListener('input', actualizarPatrones);
if (sliderTricolorAncho) sliderTricolorAncho.addEventListener('input', actualizarPatrones);
if (sliderSplashAncho) sliderSplashAncho.addEventListener('input', actualizarPatrones);
if (selectorCuerpo) {
    selectorCuerpo.addEventListener('input', () => {
        if (modeloActualGlobal === 'degradado' || modeloActualGlobal === 'dynamic-splash') {
            actualizarPatrones();
        }
    });
}

// Lógica de Capas (Remera y Pantalón)
const capasSimples = [
    { idInput: 'selector-cuerpo', idCapa: 'color-cuerpo' },
    { idInput: 'selector-mangas', idCapa: 'color-mangas' },
    { idInput: 'selector-pantalon', idCapa: 'color-pantalon' },
    { idInput: 'selector-color-gorra', idCapa: 'color-red-gorra' },
    { idInput: 'selector-color-gorra-gabardina', idCapa: 'color-gorra-gabardina' },
    { idInput: 'selector-cuerpo-musc', idCapa: 'color-cuerpo-musc' },
    { idInput: 'selector-ribetes-musc', idCapa: 'color-ribetes-musc' }
];

capasSimples.forEach(item => {
    const input = document.getElementById(item.idInput);
    const capa = document.getElementById(item.idCapa);
    if(input && capa) input.addEventListener('input', (e) => {
        capa.style.backgroundColor = e.target.value;
        if (typeof actualizarEnlacesWhatsApp === 'function') actualizarEnlacesWhatsApp();
    });
});


// --- MUSCULOSA (Género) ---
const botonesGenero = document.querySelectorAll('#modulo-musculosa .btn-genero');
botonesGenero.forEach(boton => {
    boton.addEventListener('click', () => {
        botonesGenero.forEach(b => b.classList.remove('activa'));
        boton.classList.add('activa');
        
        const genero = boton.getAttribute('data-genero');
        const rutaCuerpo = `url('../imagenes/musculosa_cuerpo_${genero}.png')`;
        const rutaRibetes = `url('../imagenes/musculosa_ribetes_${genero}.png')`;

        const capaCuerpo = document.getElementById('color-cuerpo-musc');
        const capaRibetes = document.getElementById('color-ribetes-musc');
        
        capaCuerpo.style.webkitMaskImage = rutaCuerpo; capaCuerpo.style.maskImage = rutaCuerpo;
        capaRibetes.style.webkitMaskImage = rutaRibetes; capaRibetes.style.maskImage = rutaRibetes;
        document.getElementById('textura-cuerpo-musc').style.backgroundImage = rutaCuerpo;
        document.getElementById('textura-ribetes-musc').style.backgroundImage = rutaRibetes;
    });
});


// --- MEDIAS (Paleta Fija) ---
const botonesColorMedias = document.querySelectorAll('#modulo-medias .btn-color');
const capaColorMedias = document.getElementById('color-medias');
botonesColorMedias.forEach(boton => {
    boton.addEventListener('click', () => {
        botonesColorMedias.forEach(b => b.classList.remove('activa'));
        boton.classList.add('activa');
        capaColorMedias.style.backgroundColor = boton.getAttribute('data-color');
    });
});

// Sincronización universal de botones de color al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    Object.keys(pickrActivos).forEach(targetId => {
        const input = document.getElementById(targetId);
        const contenedor = document.querySelector(`.pickr-contenedor[data-target="${targetId}"]`);
        const color = (input && input.value) || (contenedor && contenedor.getAttribute('data-default')) || '#0C43B5';
        sincronizarBotonPickr(pickrActivos[targetId], color);
    });
});

// ==========================================
// 5. LINK MÁGICO, PRESUPUESTO POR WHATSAPP Y DESCARGA DE FOTO
// ==========================================
const WHATSAPP_LEVALIER = '5492613656819';

function obtenerDetallesPrendaActiva() {
    const itemActivo = document.querySelector('.menu-prendas .menu-item.activo');
    const prenda = itemActivo ? itemActivo.innerText.replace('✓', '').trim() : 'Prenda';
    const moduloActivo = document.querySelector('.modulo-prenda.activo');
    let modelo = '';
    let colores = [];

    if (moduloActivo) {
        if (moduloActivo.id === 'modulo-remera') {
            const tarjetaActiva = document.querySelector('.tarjeta-modelo.activa');
            modelo = tarjetaActiva ? tarjetaActiva.querySelector('span').innerText.trim() : (modeloActualGlobal || 'Liso Clásico');
            if (selectorCuerpo) colores.push('• Color Base / Cuerpo: ' + selectorCuerpo.value);
            if (selectorMangas) colores.push('• Color Mangas: ' + selectorMangas.value);
            if (selectorPatron && modelo !== 'Liso Clásico') colores.push('• Color Patrón / Secundario: ' + selectorPatron.value);
            if (selectorColor3 && (modelo.includes('Tricolor') || modelo.includes('Splash') || modeloActualGlobal === 'tricolor' || modeloActualGlobal === 'splash')) {
                colores.push('• Color Terciario / Base: ' + selectorColor3.value);
            }
        } else if (moduloActivo.id === 'modulo-musculosa') {
            const cCuerpo = document.getElementById('selector-cuerpo-musc');
            const cRibetes = document.getElementById('selector-ribetes-musc');
            if (cCuerpo) colores.push('• Color Cuerpo: ' + cCuerpo.value);
            if (cRibetes) colores.push('• Color Ribetes: ' + cRibetes.value);
        } else if (moduloActivo.id === 'modulo-pantalon') {
            const cPant = document.getElementById('selector-pantalon');
            if (cPant) colores.push('• Color Pantalón: ' + cPant.value);
        } else if (moduloActivo.id === 'modulo-medias') {
            colores.push('• Color Medias: Blanco institucional');
        } else if (moduloActivo.id === 'modulo-gorras') {
            const cGorra = document.getElementById('selector-color-gorra');
            if (cGorra) colores.push('• Color Gorra Trucker: ' + cGorra.value);
        } else if (moduloActivo.id === 'modulo-gorras-gabardina') {
            const cGorraGab = document.getElementById('selector-color-gorra-gabardina');
            if (cGorraGab) colores.push('• Color Gorra Gabardina: ' + cGorraGab.value);
        }
    }
    return { prenda, modelo, colores };
}

// Genera un enlace interactivo para recrear este diseño exacto en cualquier dispositivo
function generarLinkMagico() {
    const moduloActivo = document.querySelector('.modulo-prenda.activo');
    const moduloId = moduloActivo ? moduloActivo.id : 'modulo-remera';
    const prendaSlug = moduloId.replace('modulo-', '');
    
    let urlBase = window.location.origin + window.location.pathname;
    if (!window.location.origin || window.location.origin === 'null' || window.location.protocol === 'file:') {
        urlBase = window.location.href.split('?')[0].split('#')[0];
    }
    const params = new URLSearchParams();
    params.set('prenda', prendaSlug);

    if (moduloId === 'modulo-remera') {
        params.set('modelo', modeloActualGlobal || 'liso');
        if (selectorCuerpo) params.set('c1', selectorCuerpo.value.replace('#', ''));
        if (selectorMangas) params.set('mangas', selectorMangas.value.replace('#', ''));
        if (selectorPatron && modeloActualGlobal !== 'liso') params.set('c2', selectorPatron.value.replace('#', ''));
        if (selectorColor3) params.set('c3', selectorColor3.value.replace('#', ''));
        if (sliderMitad && modeloActualGlobal === 'mitad') params.set('s_mitad', sliderMitad.value);
        if (sliderRayas && modeloActualGlobal === 'rayas') params.set('s_rayas', sliderRayas.value);
        if (sliderFranjaPos && modeloActualGlobal === 'franja') {
            params.set('s_fpos', sliderFranjaPos.value);
            params.set('s_fgro', sliderFranjaGrosor.value);
        }
        if (sliderBanda && modeloActualGlobal === 'banda') params.set('s_banda', sliderBanda.value);
        if (sliderChevronPos && modeloActualGlobal === 'chevron') {
            params.set('s_cpos', sliderChevronPos.value);
            params.set('s_cgro', sliderChevronGrosor.value);
            params.set('s_cang', sliderChevronAngulo.value);
        }
        if (sliderTricolorAncho && (modeloActualGlobal === 'tricolor' || modeloActualGlobal === 'tricolor-dynamic')) {
            params.set('s_tw', sliderTricolorAncho.value);
        }
        if (sliderSplashAncho && (modeloActualGlobal === 'splash' || modeloActualGlobal === 'dynamic-splash')) {
            params.set('s_sw', sliderSplashAncho.value);
        }
    } else if (moduloId === 'modulo-musculosa') {
        const cCuerpo = document.getElementById('selector-cuerpo-musc');
        const cRibetes = document.getElementById('selector-ribetes-musc');
        if (cCuerpo) params.set('c1', cCuerpo.value.replace('#', ''));
        if (cRibetes) params.set('c2', cRibetes.value.replace('#', ''));
    } else if (moduloId === 'modulo-pantalon') {
        const cPant = document.getElementById('selector-pantalon');
        if (cPant) params.set('c1', cPant.value.replace('#', ''));
    } else if (moduloId === 'modulo-gorras') {
        const cGorra = document.getElementById('selector-color-gorra');
        if (cGorra) params.set('c1', cGorra.value.replace('#', ''));
    } else if (moduloId === 'modulo-gorras-gabardina') {
        const cGorraGab = document.getElementById('selector-color-gorra-gabardina');
        if (cGorraGab) params.set('c1', cGorraGab.value.replace('#', ''));
    }

    return `${urlBase}?${params.toString()}`;
}

// Construye la URL de WhatsApp lista para abrir al instante
function construirUrlWhatsApp() {
    const { prenda, modelo, colores } = obtenerDetallesPrendaActiva();
    const linkMagico = generarLinkMagico();

    let texto = `¡Hola Levalier! 👋\n\nQuiero pedir presupuesto para mi diseño:\n• Prenda: ${prenda}`;
    if (modelo) texto += `\n• Modelo: ${modelo}`;

    if (colores && colores.length > 0) {
        texto += `\n\n🎨 Detalle de colores seleccionados:\n` + colores.join('\n');
    }

    // Detectar si hay dorsales, nombres o logos en el lienzo
    try {
        const canvas = typeof obtenerCanvasActivo === 'function' ? obtenerCanvasActivo() : null;
        if (canvas && canvas.getObjects().length > 0) {
            const detallesEstampados = [];
            canvas.getObjects().forEach(obj => {
                if (obj.dorsalNumero) {
                    detallesEstampados.push(`Dorsal #${obj.dorsalNumero}`);
                } else if (obj.nombreEstampado) {
                    detallesEstampados.push(`Nombre "${obj.nombreEstampado}"`);
                } else if (obj.tipoPlaceholder) {
                    detallesEstampados.push(`Estampado: ${obj.tipoPlaceholder.toUpperCase()}`);
                } else if (obj.text) {
                    if (/^\d+$/.test(obj.text.trim())) {
                        detallesEstampados.push(`Dorsal #${obj.text.trim()}`);
                    } else {
                        detallesEstampados.push(`Nombre "${obj.text.trim()}"`);
                    }
                }
            });
            if (detallesEstampados.length > 0) {
                texto += `\n\n🔢 Estampados incluidos: ` + detallesEstampados.join(', ');
            } else {
                texto += `\n\n🛡️ Estampados incluidos: Logos / Placeholders posicionados en la prenda`;
            }
        }
    } catch (eEst) {}

    texto += `\n\n🔗 Link interactivo 3D:\n${linkMagico}`;
    texto += `\n\n📸 Ya guardé la foto del diseño y te la adjunto a continuación (también te envío los archivos de mis logos para la confección).`;
    texto += `\n\n¡Quiero solicitar la cotización de confección! Muchas gracias.`;

    return `https://wa.me/${WHATSAPP_LEVALIER}?text=${encodeURIComponent(texto)}`;
}

// Actualiza en tiempo real los enlaces de WhatsApp de todos los módulos
function actualizarEnlacesWhatsApp() {
    try {
        const urlWs = construirUrlWhatsApp();
        document.querySelectorAll('.btn-presupuesto-whatsapp').forEach(btn => {
            btn.setAttribute('href', urlWs);
        });
    } catch (e) {
        console.warn('Aviso actualizando enlaces de WhatsApp:', e);
    }
}

// Generador de captura Canvas ultra liviano para descarga
async function generarCapturaDisenio() {
    const moduloActivo = document.querySelector('.modulo-prenda.activo');
    if (!moduloActivo) return null;
    const lienzo = moduloActivo.querySelector('.lienzo-remera');
    if (!lienzo) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // Fondo blanco limpio
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 800, 500);

    const cargarImg = (src, timeoutMs = 800) => new Promise((resolve) => {
        if (!src) return resolve(null);
        const img = new Image();
        let terminado = false;

        const timer = setTimeout(() => {
            if (!terminado) {
                terminado = true;
                resolve(null);
            }
        }, timeoutMs);

        img.onload = () => {
            if (!terminado) {
                terminado = true;
                clearTimeout(timer);
                resolve(img);
            }
        };
        img.onerror = () => {
            if (!terminado) {
                terminado = true;
                clearTimeout(timer);
                resolve(null);
            }
        };

        img.src = src;

        if (img.complete && img.naturalWidth > 0) {
            if (!terminado) {
                terminado = true;
                clearTimeout(timer);
                resolve(img);
            }
        }
    });

    const dibujarCapaConMascara = async (maskSrc, colorHex, svgElement = null, texturaSrc = null) => {
        const maskImg = await cargarImg(maskSrc);
        if (!maskImg) return;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 800;
        tempCanvas.height = 500;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.fillStyle = colorHex || '#0C43B5';
        tempCtx.fillRect(0, 0, 800, 500);

        if (moduloActivo.id === 'modulo-remera') {
            if (patronMitadFrente && patronMitadFrente.style.display === 'block') {
                const w = parseFloat(patronMitadFrente.style.width) || 25;
                const col = patronMitadFrente.style.backgroundColor || '#DD3939';
                tempCtx.fillStyle = col;
                tempCtx.fillRect(0, 0, (w / 100) * 800, 500);
                tempCtx.fillRect(800 - (w / 100) * 800, 0, (w / 100) * 800, 500);
            }
            if (patronRayasFrente && patronRayasFrente.style.display === 'block') {
                const colSec = selectorPatron ? selectorPatron.value : '#DD3939';
                const anchoRaya = sliderRayas ? parseFloat(sliderRayas.value) : 10;
                tempCtx.fillStyle = colSec;
                const step = (anchoRaya / 100) * 800;
                for (let x = 0; x < 800; x += step * 2) {
                    tempCtx.fillRect(x + step, 0, step, 500);
                }
            }
            if (patronDegradado && patronDegradado.style.display === 'block') {
                const colSup = selectorCuerpo ? selectorCuerpo.value : '#0C43B5';
                const colInf = selectorPatron ? selectorPatron.value : '#DD3939';
                const grad = tempCtx.createLinearGradient(0, 40, 0, 460);
                grad.addColorStop(0.12, colSup);
                grad.addColorStop(0.88, colInf);
                tempCtx.fillStyle = grad;
                tempCtx.fillRect(0, 0, 800, 500);
            }
        }

        if (svgElement && svgElement.style.display !== 'none') {
            try {
                const svgClone = svgElement.cloneNode(true);
                svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
                svgClone.setAttribute('width', '800');
                svgClone.setAttribute('height', '500');
                svgClone.setAttribute('viewBox', '0 0 800 500');
                svgClone.setAttribute('preserveAspectRatio', 'none');

                const svgXml = new XMLSerializer().serializeToString(svgClone);
                const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgXml);
                const svgImg = await cargarImg(svgDataUrl, 800);
                if (svgImg) {
                    tempCtx.drawImage(svgImg, 0, 0, 800, 500);
                }
            } catch (errSvg) {
                console.warn('Aviso SVG en captura:', errSvg);
            }
        }

        tempCtx.globalCompositeOperation = 'destination-in';
        tempCtx.drawImage(maskImg, 0, 0, 800, 500);

        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(tempCanvas, 0, 0, 800, 500);

        const texImg = texturaSrc ? await cargarImg(texturaSrc) : maskImg;
        if (texImg) {
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(texImg, 0, 0, 800, 500);
            ctx.globalCompositeOperation = 'source-over';
        }
    };

    if (moduloActivo.id === 'modulo-remera') {
        const colCuerpo = selectorCuerpo ? selectorCuerpo.value : '#0C43B5';
        const colMangas = selectorMangas ? selectorMangas.value : '#7B7777';
        await dibujarCapaConMascara('imagenes/cuerpo_web.png', colCuerpo, patronSvg, 'imagenes/cuerpo_web.png');
        await dibujarCapaConMascara('imagenes/mangas_web.png', colMangas, null, 'imagenes/mangas_web.png');
    } else if (moduloActivo.id === 'modulo-musculosa') {
        const colCuerpo = document.getElementById('selector-cuerpo-musc') ? document.getElementById('selector-cuerpo-musc').value : '#0C43B5';
        const colRibetes = document.getElementById('selector-ribetes-musc') ? document.getElementById('selector-ribetes-musc').value : '#DD3939';
        await dibujarCapaConMascara('imagenes/musculosa_cuerpo_hombre_web.png', colCuerpo, null, 'imagenes/musculosa_cuerpo_hombre_web.png');
        await dibujarCapaConMascara('imagenes/musculosa_ribetes_hombre_web.png', colRibetes, null, 'imagenes/musculosa_ribetes_hombre_web.png');
    } else if (moduloActivo.id === 'modulo-pantalon') {
        const col = document.getElementById('selector-pantalon') ? document.getElementById('selector-pantalon').value : '#0C43B5';
        await dibujarCapaConMascara('imagenes/pantalon_web.png', col, null, 'imagenes/pantalon_web.png');
    } else if (moduloActivo.id === 'modulo-medias') {
        const col = '#FFFFFF';
        await dibujarCapaConMascara('imagenes/medias_web.png', col, null, 'imagenes/medias_web.png');
    } else if (moduloActivo.id === 'modulo-gorras') {
        const col = document.getElementById('selector-color-gorra') ? document.getElementById('selector-color-gorra').value : '#0C43B5';
        await dibujarCapaConMascara('imagenes/gorra_red.png', col, null, 'imagenes/gorra_completa.png');
    } else if (moduloActivo.id === 'modulo-gorras-gabardina') {
        const col = document.getElementById('selector-color-gorra-gabardina') ? document.getElementById('selector-color-gorra-gabardina').value : '#0C43B5';
        await dibujarCapaConMascara('imagenes/gorra_gabardina.png', col, null, 'imagenes/gorra_gabardina.png');
    }

    const mapaLogos = {
        'modulo-remera': 'canvas-logos',
        'modulo-musculosa': 'canvas-logos-musc',
        'modulo-pantalon': 'canvas-logos-pantalon',
        'modulo-medias': 'canvas-logos-medias',
        'modulo-gorras': 'canvas-logos-gorras',
        'modulo-gorras-gabardina': 'canvas-logos-gorras-gabardina'
    };
    const idLogo = mapaLogos[moduloActivo.id];
    if (idLogo && canvasActivos && canvasActivos[idLogo]) {
        try {
            const fCanvas = canvasActivos[idLogo];
            if (fCanvas && fCanvas.getObjects && fCanvas.getObjects().length > 0) {
                fCanvas.discardActiveObject();
                fCanvas.renderAll();
                const elLogos = fCanvas.getElement();
                if (elLogos) ctx.drawImage(elLogos, 0, 0, 800, 500);
            }
        } catch (eLogo) {}
    }

    ctx.fillStyle = 'rgba(26, 30, 41, 0.9)';
    ctx.fillRect(0, 465, 800, 35);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LEVALIER INDUMENTARIA DEPORTIVA | www.levalier.com.ar', 20, 487);

    const { prenda, modelo } = obtenerDetallesPrendaActiva();
    const etiqueta = modelo ? `${prenda} - ${modelo}` : prenda;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(etiqueta.toUpperCase(), 780, 487);

    return canvas;
}

// Botón Paso 1: Guardar Foto del diseño en el dispositivo
document.querySelectorAll('.btn-guardar-foto').forEach(btn => {
    btn.addEventListener('click', async function(e) {
        e.preventDefault();
        const textoOriginal = btn.innerHTML;
        btn.innerHTML = '<span class="icono-foto-btn">⏳</span><span class="txt-foto-btn">Generando imagen...</span>';
        btn.style.pointerEvents = 'none';

        try {
            const canvasCaptura = await generarCapturaDisenio();
            if (canvasCaptura) {
                const dataUrl = canvasCaptura.toDataURL('image/png');
                const { prenda, modelo } = obtenerDetallesPrendaActiva();
                const nombreArchivo = `Disenio_Levalier_${prenda.replace(/\s+/g, '_')}${modelo ? '_' + modelo.replace(/\s+/g, '_') : ''}.png`;

                const enlace = document.createElement('a');
                enlace.download = nombreArchivo;
                enlace.href = dataUrl;
                document.body.appendChild(enlace);
                enlace.click();
                document.body.removeChild(enlace);

                // Feedback visual dinámico guiando hacia el Paso 2
                btn.innerHTML = '<span class="icono-foto-btn">✅</span><span class="txt-foto-btn">¡Foto guardada! Ahora tocá el Paso 2 👇</span>';

                // Resaltar con animación el botón de WhatsApp del mismo bloque
                const seccion = btn.closest('.seccion-presupuesto');
                const btnWs = seccion ? seccion.querySelector('.btn-presupuesto-whatsapp') : null;
                if (btnWs) {
                    btnWs.classList.add('atencion-paso-2');
                }

                setTimeout(() => {
                    btn.innerHTML = textoOriginal;
                    btn.style.pointerEvents = 'auto';
                }, 3500);
                return;
            }
        } catch (err) {
            console.warn('Aviso guardando imagen:', err);
            if (window.location.protocol === 'file:') {
                alert('Aviso de prueba local:\n\nAl abrir el archivo directamente en tu navegador (file://), las políticas de seguridad locales bloquean la exportación de imágenes en el lienzo (canvas).\n\nAl desplegar en Vercel (o en cualquier servidor web), la descarga de foto funcionará perfectamente al compartir el mismo dominio.');
            }
        }

        btn.innerHTML = textoOriginal;
        btn.style.pointerEvents = 'auto';
    });
});

// Botón Paso 2: enlace directo de WhatsApp
document.querySelectorAll('.btn-presupuesto-whatsapp').forEach(btn => {
    btn.addEventListener('mouseenter', actualizarEnlacesWhatsApp);
    btn.addEventListener('touchstart', actualizarEnlacesWhatsApp, { passive: true });
    btn.addEventListener('click', function(e) {
        btn.classList.remove('atencion-paso-2');
        actualizarEnlacesWhatsApp();
        const urlWs = btn.getAttribute('href');
        // Si el enlace aún tuviera '#' por cualquier motivo, prevenimos la recarga y abrimos WhatsApp
        if (!urlWs || urlWs === '#' || urlWs.startsWith('#')) {
            e.preventDefault();
            const nuevaUrl = construirUrlWhatsApp();
            btn.setAttribute('href', nuevaUrl);
            window.open(nuevaUrl, '_blank');
        }
    });
});

// Botón principal de WhatsApp: enlace directo que asegura URL actualizada al tocar
document.querySelectorAll('.btn-presupuesto-whatsapp').forEach(btn => {
    btn.addEventListener('mouseenter', actualizarEnlacesWhatsApp);
    btn.addEventListener('touchstart', actualizarEnlacesWhatsApp, { passive: true });
    btn.addEventListener('click', function(e) {
        actualizarEnlacesWhatsApp();
        const urlWs = btn.getAttribute('href');
        // Si el enlace aún tuviera '#' por cualquier motivo, prevenimos la recarga y abrimos WhatsApp
        if (!urlWs || urlWs === '#' || urlWs.startsWith('#')) {
            e.preventDefault();
            const nuevaUrl = construirUrlWhatsApp();
            btn.setAttribute('href', nuevaUrl);
            window.open(nuevaUrl, '_blank');
        }
    });
});

// Restauración automática del diseño desde los parámetros de la URL ("Link Mágico")
function restaurarDisenioDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('prenda')) {
        actualizarEnlacesWhatsApp();
        return;
    }

    const prendaParam = params.get('prenda');
    const moduloId = 'modulo-' + prendaParam;
    const moduloEl = document.getElementById(moduloId);
    if (!moduloEl) return;

    // 1. Activar módulo de la prenda
    document.querySelectorAll('.modulo-prenda').forEach(m => m.classList.remove('activo'));
    moduloEl.classList.add('activo');

    document.querySelectorAll('.menu-item').forEach(item => {
        if (item.getAttribute('data-target') === moduloId) {
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('activo'));
            item.classList.add('activo');
        }
    });

    // 2. Si es remera, restaurar modelo y colores
    if (moduloId === 'modulo-remera') {
        const modeloParam = params.get('modelo');
        if (modeloParam && CONFIG_MODELOS_REMERA[modeloParam]) {
            seleccionarModelo(modeloParam);
            document.querySelectorAll('.tarjeta-modelo').forEach(t => {
                if (t.getAttribute('data-modelo') === modeloParam) {
                    document.querySelectorAll('.tarjeta-modelo').forEach(tm => tm.classList.remove('activa'));
                    t.classList.add('activa');
                }
            });
        }

        if (params.has('c1')) aplicarColorASelector('selector-cuerpo', '#' + params.get('c1'));
        if (params.has('mangas')) aplicarColorASelector('selector-mangas', '#' + params.get('mangas'));
        if (params.has('c2')) aplicarColorASelector('selector-patron', '#' + params.get('c2'));
        if (params.has('c3')) aplicarColorASelector('selector-color-3', '#' + params.get('c3'));

        if (params.has('s_mitad') && sliderMitad) sliderMitad.value = params.get('s_mitad');
        if (params.has('s_rayas') && sliderRayas) sliderRayas.value = params.get('s_rayas');
        if (params.has('s_fpos') && sliderFranjaPos) sliderFranjaPos.value = params.get('s_fpos');
        if (params.has('s_fgro') && sliderFranjaGrosor) sliderFranjaGrosor.value = params.get('s_fgro');
        if (params.has('s_banda') && sliderBanda) sliderBanda.value = params.get('s_banda');
        if (params.has('s_cpos') && sliderChevronPos) sliderChevronPos.value = params.get('s_cpos');
        if (params.has('s_cgro') && sliderChevronGrosor) sliderChevronGrosor.value = params.get('s_cgro');
        if (params.has('s_cang') && sliderChevronAngulo) sliderChevronAngulo.value = params.get('s_cang');
        if (params.has('s_tw') && sliderTricolorAncho) sliderTricolorAncho.value = params.get('s_tw');
        if (params.has('s_sw') && sliderSplashAncho) sliderSplashAncho.value = params.get('s_sw');

        actualizarPatrones();
    } else if (moduloId === 'modulo-musculosa') {
        if (params.has('c1')) aplicarColorASelector('selector-cuerpo-musc', '#' + params.get('c1'));
        if (params.has('c2')) aplicarColorASelector('selector-ribetes-musc', '#' + params.get('c2'));
    } else if (moduloId === 'modulo-pantalon') {
        if (params.has('c1')) aplicarColorASelector('selector-pantalon', '#' + params.get('c1'));
    } else if (moduloId === 'modulo-gorras') {
        if (params.has('c1')) aplicarColorASelector('selector-color-gorra', '#' + params.get('c1'));
    } else if (moduloId === 'modulo-gorras-gabardina') {
        if (params.has('c1')) aplicarColorASelector('selector-color-gorra-gabardina', '#' + params.get('c1'));
    }

    actualizarEnlacesWhatsApp();
}

// Inicialización de eventos al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    restaurarDisenioDesdeURL();
    actualizarEnlacesWhatsApp();
});
actualizarEnlacesWhatsApp();

// ==========================================
// 6. MODAL INSTRUCTIVO / ONBOARDING INICIAL
// ==========================================
const modalOnboarding = document.getElementById('modal-instructivo-inicial');
const btnCerrarOnboarding = document.getElementById('btn-cerrar-onboarding');
const btnEmpezarDisenio = document.getElementById('btn-empezar-disenio');
const btnAyudaInstructivo = document.getElementById('btn-ayuda-instructivo');

function abrirOnboarding() {
    if (modalOnboarding) {
        modalOnboarding.classList.remove('oculto');
        document.body.style.overflow = 'hidden';
    }
}

function cerrarOnboarding() {
    if (modalOnboarding) {
        modalOnboarding.classList.add('oculto');
        document.body.style.overflow = '';
        localStorage.setItem('levalier_onboarding_visto', 'true');
    }
}

if (btnCerrarOnboarding) btnCerrarOnboarding.addEventListener('click', cerrarOnboarding);
if (btnEmpezarDisenio) btnEmpezarDisenio.addEventListener('click', cerrarOnboarding);
if (btnAyudaInstructivo) btnAyudaInstructivo.addEventListener('click', abrirOnboarding);
if (modalOnboarding) {
    modalOnboarding.addEventListener('click', (e) => {
        if (e.target === modalOnboarding) cerrarOnboarding();
    });
}

// Abrir automáticamente la primera vez que entra al diseñador
window.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('levalier_onboarding_visto')) {
        setTimeout(abrirOnboarding, 450);
    }
});

// ==========================================
// 7. SISTEMA DE ESTAMPADOS, DORSALES Y LOGOS (CAJÓN DE RECURSOS)
// ==========================================
let colorEstampadoActual = '#FFFFFF';

// Plantillas SVG vectoriales para los Placeholders de Marca, Escudo y Sponsor
const PLANTILLAS_SVG_ESTAMPADOS = {
    escudo: (color) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 360" width="300" height="360">
  <!-- Silueta externa del escudo en alta definición -->
  <path d="M150 15 L255 60 L255 195 C255 285 150 345 150 345 C150 345 45 285 45 195 L45 60 Z" fill="none" stroke="${color}" stroke-width="14" stroke-linejoin="round" />
  <!-- Borde interior elegante -->
  <path d="M150 42 L234 78 L234 189 C234 264 150 312 150 312 C150 312 66 264 66 189 L66 78 Z" fill="none" stroke="${color}" stroke-width="4" stroke-opacity="0.8" />
  <!-- Estrella deportiva central -->
  <polygon points="150,84 162,120 201,120 168,144 180,180 150,156 120,180 132,144 99,120 138,120" fill="${color}" />
  <!-- Tipografía nítida centrada -->
  <text x="150" y="246" font-family="'Bebas Neue', 'Oswald', sans-serif" font-size="46" font-weight="900" fill="${color}" text-anchor="middle" letter-spacing="3">TU ESCUDO</text>
  <text x="150" y="278" font-family="'Bebas Neue', 'Oswald', sans-serif" font-size="20" font-weight="700" fill="${color}" text-anchor="middle" letter-spacing="4" opacity="0.85">O LOGO AQUÍ</text>
</svg>`,

    sponsor: (color) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 160" width="600" height="160">
  <!-- Marco contenedor de sponsor deportivo de alta resolución (sin trazos punteados borrosos) -->
  <rect x="8" y="8" width="584" height="144" rx="16" fill="none" stroke="${color}" stroke-width="8" />
  <rect x="22" y="22" width="556" height="116" rx="10" fill="none" stroke="${color}" stroke-width="2" stroke-opacity="0.65" />
  <!-- Texto principal y subtítulo en ultra nitidez -->
  <text x="300" y="96" font-family="'Bebas Neue', 'Oswald', sans-serif" font-size="74" font-weight="900" fill="${color}" text-anchor="middle" letter-spacing="8">SPONSOR</text>
  <text x="300" y="126" font-family="'Bebas Neue', 'Oswald', sans-serif" font-size="18" font-weight="700" fill="${color}" text-anchor="middle" letter-spacing="5" opacity="0.85">ESPACIO PUBLICITARIO</text>
</svg>`,

    levalier: (color) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 160" width="500" height="160">
  <text x="250" y="95" font-family="'Bebas Neue', 'Oswald', sans-serif" font-size="82" font-weight="900" fill="${color}" text-anchor="middle" letter-spacing="6">LEVALIER</text>
  <path d="M 80 120 Q 250 148 420 120" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" />
  <text x="250" y="148" font-family="'Bebas Neue', 'Oswald', sans-serif" font-size="16" font-weight="700" fill="${color}" text-anchor="middle" letter-spacing="5" opacity="0.85">INDUMENTARIA DEPORTIVA</text>
</svg>`
};

// Retorna el lienzo de Fabric.js correspondiente a la prenda activa
function obtenerCanvasActivo() {
    const moduloActivo = document.querySelector('.modulo-prenda.activo');
    const moduloId = moduloActivo ? moduloActivo.id : 'modulo-remera';
    const mapa = {
        'modulo-remera': 'canvas-logos',
        'modulo-musculosa': 'canvas-logos-musc',
        'modulo-pantalon': 'canvas-logos-pantalon',
        'modulo-medias': 'canvas-logos-medias',
        'modulo-gorras': 'canvas-logos-gorras',
        'modulo-gorras-gabardina': 'canvas-logos-gorras-gabardina'
    };
    const id = mapa[moduloId] || 'canvas-logos';
    return canvasActivos[id];
}

// Actualiza el botón de eliminar del módulo activo
function refrescarBotonEliminarActivo() {
    const canvas = obtenerCanvasActivo();
    if (!canvas) return;
    const moduloActivo = document.querySelector('.modulo-prenda.activo');
    if (!moduloActivo) return;
    const btnEliminar = moduloActivo.querySelector('.btn-eliminar');
    if (btnEliminar) {
        if (canvas.getObjects().length > 0) {
            btnEliminar.classList.remove('oculto');
        } else {
            btnEliminar.classList.add('oculto');
        }
    }
}

// Actualiza la visualización de la paleta de colores de estampados
function actualizarVisualPaleta(colorHex) {
    if (!colorHex) return;
    colorEstampadoActual = colorHex;
    document.querySelectorAll('.btn-swatch-estampado').forEach(btn => {
        if (btn.getAttribute('data-color').toLowerCase() === colorHex.toLowerCase()) {
            btn.classList.add('activa');
        } else {
            btn.classList.remove('activa');
        }
    });
    document.querySelectorAll('.input-color-estampado-picker').forEach(inp => inp.value = colorHex);
}

// Cambia el color activo para los estampados y recolorea el objeto seleccionado en tiempo real
function cambiarColorEstampado(colorHex) {
    if (!colorHex) return;
    actualizarVisualPaleta(colorHex);

    const canvas = obtenerCanvasActivo();
    if (!canvas) return;
    const objActivo = canvas.getActiveObject();
    if (objActivo) {
        recolorearObjetoFabric(objActivo, colorHex);
        canvas.requestRenderAll();
    } else {
        // Si no hay ningún objeto seleccionado pero hay un único estampado en el lienzo, recolorearlo directamente
        const objs = canvas.getObjects();
        if (objs.length === 1) {
            recolorearObjetoFabric(objs[0], colorHex);
            canvas.requestRenderAll();
        }
    }
}

// Carga una imagen de forma asíncrona devolviendo Promise<HTMLImageElement | null>
function cargarElementoImgAsync(src) {
    return new Promise((resolve) => {
        if (!src) return resolve(null);
        const img = new Image();
        if (window.location.protocol !== 'file:') {
            img.crossOrigin = 'anonymous';
        }
        let terminado = false;
        const terminar = (resultado) => {
            if (!terminado) {
                terminado = true;
                resolve(resultado);
            }
        };
        img.onload = () => terminar(img);
        img.onerror = () => terminar(null);
        img.src = src;
        if (img.complete && img.naturalWidth > 0) {
            terminar(img);
        }
    });
}

// Crea un canvas fuera de pantalla con una o varias imágenes de dígitos Levalier combinadas y tintadas al color deseado
function crearCanvasNumeroLevalier(listaImgs, colorHex) {
    if (!listaImgs || listaImgs.length === 0) return null;

    // Altura de referencia normalizada para igualar dimensiones de dígitos oficiales
    const alturaRef = 1150;
    
    // Normalizar anchos según la altura de referencia
    const items = listaImgs.map(img => {
        const h = img.naturalHeight || img.height || alturaRef;
        const w = img.naturalWidth || img.width || 800;
        const ratio = alturaRef / h;
        return { img, ancho: Math.round(w * ratio) };
    });

    // Espaciado sutil entre dígitos proporcionales
    const espaciado = listaImgs.length > 1 ? 30 : 0;
    const anchoTotal = items.reduce((acc, it) => acc + it.ancho, 0) + (espaciado * (listaImgs.length - 1));

    const offCanvas = document.createElement('canvas');
    offCanvas.width = Math.max(1, Math.round(anchoTotal));
    offCanvas.height = alturaRef;
    const ctx = offCanvas.getContext('2d');

    // 1. Dibujar los dígitos originales (silueta con canal alfa)
    let curX = 0;
    items.forEach(it => {
        ctx.drawImage(it.img, curX, 0, it.ancho, alturaRef);
        curX += it.ancho + espaciado;
    });

    // 2. Tintar al color seleccionado manteniendo los bordes antialiasing
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = colorHex || '#FFFFFF';
    ctx.fillRect(0, 0, offCanvas.width, offCanvas.height);

    return offCanvas;
}

// Función auxiliar para cambiar el color de un objeto o grupo de Fabric
function recolorearObjetoFabric(obj, colorHex) {
    if (!obj) return;
    if (obj.esNumeroOficialLevalier && obj.listaImagenesOriginales) {
        const nuevoCanvas = crearCanvasNumeroLevalier(obj.listaImagenesOriginales, colorHex);
        if (nuevoCanvas) {
            obj.setElement(nuevoCanvas);
            obj.colorEstampado = colorHex;
        }
    } else if (obj.esLogoOficialMarca && obj.originalImgElement) {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = obj.originalImgElement.naturalWidth || obj.originalImgElement.width;
        offCanvas.height = obj.originalImgElement.naturalHeight || obj.originalImgElement.height;
        const ctx = offCanvas.getContext('2d');
        ctx.drawImage(obj.originalImgElement, 0, 0);
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = colorHex;
        ctx.fillRect(0, 0, offCanvas.width, offCanvas.height);
        obj.setElement(offCanvas);
        obj.colorEstampado = colorHex;
    } else if (obj.type === 'text' || obj.type === 'i-text') {
        obj.set('fill', colorHex);
        obj.colorEstampado = colorHex;
    } else if (obj.type === 'group' && obj.getObjects) {
        obj.colorEstampado = colorHex;
        obj.getObjects().forEach(hijo => recolorearObjetoFabric(hijo, colorHex));
    } else if (obj.type === 'path' || obj.type === 'polygon' || obj.type === 'rect') {
        if (obj.fill && obj.fill !== 'none') obj.set('fill', colorHex);
        if (obj.stroke && obj.stroke !== 'none') obj.set('stroke', colorHex);
    }
}

// Agrega un dorsal / número al lienzo activo (prioriza los PNGs oficiales de Levalier en imagenes/numeros/)
async function agregarNumeroAlCanvas(numeroStr) {
    const canvas = obtenerCanvasActivo();
    if (!canvas) return;

    const textoNum = String(numeroStr).trim();
    if (!textoNum) return;

    // 1. Intentar cargar el archivo directo (ej: imagenes/numeros/2.png o imagenes/numeros/10.png)
    let imgsCargadas = [];
    const imgDirecta = await cargarElementoImgAsync(`imagenes/numeros/${textoNum}.png`);
    
    if (imgDirecta) {
        imgsCargadas = [imgDirecta];
    } else if (textoNum.length > 1) {
        // 2. Si es de varios dígitos (ej: "23", "24", "10") y no hay archivo compuesto directo,
        // intentar cargar cada dígito por separado
        const digitos = textoNum.split('');
        const promesas = digitos.map(d => cargarElementoImgAsync(`imagenes/numeros/${d}.png`));
        const resultados = await Promise.all(promesas);
        if (resultados.every(img => img !== null)) {
            imgsCargadas = resultados;
        }
    }

    // Si había un número previamente seleccionado en el lienzo, lo quitamos para reemplazarlo limpiamente
    const objActivo = canvas.getActiveObject();
    if (objActivo && (objActivo.esNumeroOficialLevalier || (objActivo.text && /^\d+$/.test(objActivo.text.trim())))) {
        canvas.remove(objActivo);
    }

    // 3. Si se encontraron las imágenes oficiales Levalier:
    if (imgsCargadas.length > 0) {
        const offCanvas = crearCanvasNumeroLevalier(imgsCargadas, colorEstampadoActual);
        if (offCanvas) {
            const fabricImg = new fabric.Image(offCanvas);

            // Escalar para que calce estéticamente en la remera (altura aprox. 135px en el lienzo de 500px)
            const alturaObjetivo = textoNum.length >= 3 ? 115 : (textoNum.length === 2 ? 130 : 140);
            fabricImg.scaleToHeight(alturaObjetivo);

            const anchoEscalado = fabricImg.getScaledWidth();

            fabricImg.set({
                left: 213 - (anchoEscalado / 2), // 213 es el centro del frente
                top: 165,
                cornerColor: '#0055ff',
                cornerStrokeColor: '#ffffff',
                cornerSize: 12,
                transparentCorners: false
            });

            // Guardar metadatos para recolorear dinámicamente y presupuestar en WhatsApp
            fabricImg.esNumeroOficialLevalier = true;
            fabricImg.dorsalNumero = textoNum;
            fabricImg.listaImagenesOriginales = imgsCargadas;
            fabricImg.colorEstampado = colorEstampadoActual;

            canvas.add(fabricImg);
            canvas.setActiveObject(fabricImg);
            canvas.requestRenderAll();
            refrescarBotonEliminarActivo();
            if (typeof actualizarEnlacesWhatsApp === 'function') actualizarEnlacesWhatsApp();
            return;
        }
    }

    // 4. Fallback si el número o algún dígito aún no tiene PNG en imagenes/numeros/
    // (permite que la web siga 100% operativa con tipografía deportiva hasta que carguen los demás PNGs)
    const tamañoFuente = textoNum.length >= 3 ? 65 : (textoNum.length === 2 ? 80 : 95);
    const numObj = new fabric.Text(textoNum, {
        left: canvas.width / 4 - 30,
        top: 175,
        fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
        fontSize: tamañoFuente,
        fill: colorEstampadoActual,
        fontWeight: 'bold',
        textAlign: 'center',
        cornerColor: '#0055ff',
        cornerStrokeColor: '#ffffff',
        cornerSize: 12,
        transparentCorners: false
    });
    numObj.dorsalNumero = textoNum;
    numObj.colorEstampado = colorEstampadoActual;

    canvas.add(numObj);
    canvas.setActiveObject(numObj);
    canvas.requestRenderAll();
    refrescarBotonEliminarActivo();
    if (typeof actualizarEnlacesWhatsApp === 'function') actualizarEnlacesWhatsApp();
}

// Agrega un nombre o texto personalizado al lienzo activo
function agregarTextoAlCanvas(textoStr) {
    const canvas = obtenerCanvasActivo();
    if (!canvas) return;

    const textoLimpio = String(textoStr).trim().toUpperCase();
    if (!textoLimpio) return;

    // Si había un nombre seleccionado previamente, reemplazarlo
    const objActivo = canvas.getActiveObject();
    if (objActivo && (objActivo.nombreEstampado || (objActivo.text && !/^\d+$/.test(objActivo.text.trim())))) {
        canvas.remove(objActivo);
    }

    const tamañoFuente = textoLimpio.length > 10 ? 28 : 36;

    const textoObj = new fabric.Text(textoLimpio, {
        left: 213 - (textoLimpio.length * (tamañoFuente * 0.35)),
        top: 115,
        fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
        fontSize: tamañoFuente,
        fill: colorEstampadoActual,
        fontWeight: 'bold',
        textAlign: 'center',
        cornerColor: '#0055ff',
        cornerStrokeColor: '#ffffff',
        cornerSize: 12,
        transparentCorners: false
    });

    textoObj.nombreEstampado = textoLimpio;
    textoObj.colorEstampado = colorEstampadoActual;

    canvas.add(textoObj);
    canvas.setActiveObject(textoObj);
    canvas.requestRenderAll();
    refrescarBotonEliminarActivo();
    if (typeof actualizarEnlacesWhatsApp === 'function') actualizarEnlacesWhatsApp();
}

// Agrega un placeholder gráfico (escudo, sponsor o marca Levalier) al lienzo activo
async function agregarPlaceholderAlCanvas(tipo) {
    const canvas = obtenerCanvasActivo();
    if (!canvas) return;

    // 1. Si se solicita la marca Levalier, verificar si existe un PNG oficial transparente en imagenes/logo_marca.png
    if (tipo === 'levalier') {
        const imgOficial = await cargarElementoImgAsync('imagenes/logo_marca.png');
        if (imgOficial) {
            const offCanvas = document.createElement('canvas');
            offCanvas.width = imgOficial.naturalWidth || imgOficial.width;
            offCanvas.height = imgOficial.naturalHeight || imgOficial.height;
            const ctx = offCanvas.getContext('2d');
            ctx.drawImage(imgOficial, 0, 0);
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = colorEstampadoActual;
            ctx.fillRect(0, 0, offCanvas.width, offCanvas.height);

            const fabricImg = new fabric.Image(offCanvas);
            fabricImg.scaleToWidth(130);
            fabricImg.set({
                left: 213 - (fabricImg.getScaledWidth() / 2),
                top: 135,
                cornerColor: '#0055ff',
                cornerStrokeColor: '#ffffff',
                cornerSize: 12,
                transparentCorners: false
            });
            fabricImg.esLogoOficialMarca = true;
            fabricImg.originalImgElement = imgOficial;
            fabricImg.colorEstampado = colorEstampadoActual;
            fabricImg.tipoPlaceholder = 'marca_levalier';

            canvas.add(fabricImg);
            canvas.setActiveObject(fabricImg);
            canvas.requestRenderAll();
            refrescarBotonEliminarActivo();
            if (typeof actualizarEnlacesWhatsApp === 'function') actualizarEnlacesWhatsApp();
            return;
        }
    }

    // 2. Si no hay archivo PNG oficial o para escudo y sponsor, renderizar plantilla vectorial SVG de alta definición
    const generadorSvg = PLANTILLAS_SVG_ESTAMPADOS[tipo];
    if (!generadorSvg) return;

    const svgXml = generadorSvg(colorEstampadoActual);

    fabric.loadSVGFromString(svgXml, function(objects, options) {
        if (!objects || objects.length === 0) return;
        const svgGrupo = fabric.util.groupSVGElements(objects, options);

        let escala = 1;
        let posTop = 140;

        if (tipo === 'sponsor') {
            // Escalar desde 600px a ~264px para ultra nitidez en el pecho
            escala = 0.44;
            posTop = 220;
        } else if (tipo === 'escudo') {
            // Escalar desde 300px a ~84px de ancho para tamaño deportivo perfecto
            escala = 0.28;
            posTop = 135;
        } else if (tipo === 'levalier') {
            // Escalar desde 500px a ~140px
            escala = 0.28;
            posTop = 130;
        }

        svgGrupo.set({
            scaleX: escala,
            scaleY: escala,
            left: 213 - (svgGrupo.width * escala) / 2,
            top: posTop,
            cornerColor: '#0055ff',
            cornerStrokeColor: '#ffffff',
            cornerSize: 12,
            transparentCorners: false
        });

        svgGrupo.tipoPlaceholder = tipo;
        svgGrupo.colorEstampado = colorEstampadoActual;

        canvas.add(svgGrupo);
        canvas.setActiveObject(svgGrupo);
        canvas.requestRenderAll();
        refrescarBotonEliminarActivo();
        if (typeof actualizarEnlacesWhatsApp === 'function') actualizarEnlacesWhatsApp();
    });
}

// Inicialización de eventos del Cajón de Estampados al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
    // 1. Swatches de color
    document.querySelectorAll('.btn-swatch-estampado').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-color');
            cambiarColorEstampado(color);
        });
    });

    // 2. Input color picker personalizado
    document.querySelectorAll('.input-color-estampado-picker').forEach(picker => {
        picker.addEventListener('input', (e) => {
            cambiarColorEstampado(e.target.value);
        });
    });

    // 3. Dígitos rápidos (0 al 10)
    document.querySelectorAll('.btn-digito-cajon').forEach(btn => {
        btn.addEventListener('click', () => {
            const num = btn.getAttribute('data-num');
            agregarNumeroAlCanvas(num);
        });
    });

    // 4. Agregar número personalizado por input
    document.querySelectorAll('.btn-agregar-numero-custom').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const contenedor = e.target.closest('.grupo-control');
            const input = contenedor ? contenedor.querySelector('.input-numero-custom') : null;
            if (input && input.value !== '') {
                agregarNumeroAlCanvas(input.value);
                input.value = '';
            }
        });
    });

    document.querySelectorAll('.input-numero-custom').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (input.value !== '') {
                    agregarNumeroAlCanvas(input.value);
                    input.value = '';
                }
            }
        });
    });

    // 5. Agregar nombre o texto personalizado
    document.querySelectorAll('.btn-agregar-nombre-custom').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const contenedor = e.target.closest('.grupo-control');
            const input = contenedor ? contenedor.querySelector('.input-nombre-custom') : null;
            if (input && input.value.trim() !== '') {
                agregarTextoAlCanvas(input.value);
                input.value = '';
            }
        });
    });

    document.querySelectorAll('.input-nombre-custom').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (input.value.trim() !== '') {
                    agregarTextoAlCanvas(input.value);
                    input.value = '';
                }
            }
        });
    });

    // 6. Botones de Placeholders (Escudo, Sponsor, Levalier)
    document.querySelectorAll('.btn-item-placeholder').forEach(btn => {
        btn.addEventListener('click', () => {
            const tipo = btn.getAttribute('data-tipo');
            agregarPlaceholderAlCanvas(tipo);
        });
    });

    // 7. Sincronizar el color activo cuando el usuario selecciona un objeto existente
    Object.values(canvasActivos).forEach(canvas => {
        if (!canvas) return;
        const sincronizarSeleccion = (e) => {
            const obj = e.selected ? e.selected[0] : canvas.getActiveObject();
            if (obj && obj.colorEstampado) {
                actualizarVisualPaleta(obj.colorEstampado);
            } else if (obj && obj.fill && typeof obj.fill === 'string' && obj.fill.startsWith('#')) {
                actualizarVisualPaleta(obj.fill);
            }
            refrescarBotonEliminarActivo();
        };
        canvas.on('selection:created', sincronizarSeleccion);
        canvas.on('selection:updated', sincronizarSeleccion);
        canvas.on('selection:cleared', refrescarBotonEliminarActivo);
        canvas.on('object:added', refrescarBotonEliminarActivo);
        canvas.on('object:removed', refrescarBotonEliminarActivo);
    });

    // Inicializar visualización del botón desplegable con el estilo actual
    if (typeof actualizarBotonDropdownEstilo === 'function') {
        actualizarBotonDropdownEstilo(typeof modeloActualGlobal !== 'undefined' ? modeloActualGlobal : 'liso');
    }
});
