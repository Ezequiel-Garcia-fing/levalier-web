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

    // Control de visibilidad del botón eliminar
    if (btnEliminar) {
        canvas.on('selection:created', () => btnEliminar.classList.remove('oculto'));
        canvas.on('selection:updated', () => btnEliminar.classList.remove('oculto'));
        canvas.on('selection:cleared', () => btnEliminar.classList.add('oculto'));

        btnEliminar.addEventListener('click', function() {
            const logoActivo = canvas.getActiveObject();
            if (logoActivo) {
                canvas.remove(logoActivo);
                canvas.discardActiveObject();
                canvas.requestRenderAll();
            }
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
                // PARÁMETROS DE CENTRADO Y GEOMETRÍA DEL CHEVRON EN "V"
                // ========================================================
                const centroFrente = 224;   // <-- Centro Frente: reducir para mover a la IZQUIERDA, aumentar para DERECHA
                const centroEspalda = 575;  // <-- Centro Espalda: aumentar para mover a la DERECHA, reducir para IZQUIERDA
                const apertura = 122;       // Separación horizontal hacia los hombros

                // Parámetros interactivos controlados por los sliders para los clientes:
                const y = sliderChevronPos ? parseFloat(sliderChevronPos.value) : 280;
                const grosor = sliderChevronGrosor ? parseFloat(sliderChevronGrosor.value) : 75;
                const inclinacion = sliderChevronAngulo ? parseFloat(sliderChevronAngulo.value) : 160;

                const yTop = y - inclinacion;
                const yTop2 = yTop + grosor;
                const yApex2 = y + grosor;

                const xIzqFrente = centroFrente - apertura;
                const xDerFrente = centroFrente + apertura;
                const xIzqEspalda = centroEspalda - apertura;
                const xDerEspalda = centroEspalda + apertura;

                svgChevronFrente.setAttribute('points', `${xIzqFrente},${yTop} ${centroFrente},${y} ${xDerFrente},${yTop} ${xDerFrente},${yTop2} ${centroFrente},${yApex2} ${xIzqFrente},${yTop2}`);
                svgChevronEspalda.setAttribute('points', `${xIzqEspalda},${yTop} ${centroEspalda},${y} ${xDerEspalda},${yTop} ${xDerEspalda},${yTop2} ${centroEspalda},${yApex2} ${xIzqEspalda},${yTop2}`);
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
    if(input && capa) input.addEventListener('input', (e) => capa.style.backgroundColor = e.target.value);
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
// 5. CAPTURA Y PRESUPUESTO POR WHATSAPP
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

async function generarCapturaDisenio() {
    const moduloActivo = document.querySelector('.modulo-prenda.activo');
    if (!moduloActivo) return null;
    const lienzo = moduloActivo.querySelector('.lienzo-remera');
    if (!lienzo) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // 1. Fondo blanco limpio
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 800, 500);

    // Carga de imágenes con timeout estricto para evitar bloqueos
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

        // Color base de la capa
        tempCtx.fillStyle = colorHex || '#0C43B5';
        tempCtx.fillRect(0, 0, 800, 500);

        // Si hay patrones CSS tradicionales en Remera
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

        // Si hay SVG vectorial activo (Franja, Banda, Chevron, Tricolor, Splash)
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
                console.warn('Aviso al procesar SVG vectorial en captura:', errSvg);
            }
        }

        // Aplicar silueta de la prenda mediante máscara destination-in
        tempCtx.globalCompositeOperation = 'destination-in';
        tempCtx.drawImage(maskImg, 0, 0, 800, 500);

        // Estampar capa recortada en el lienzo principal
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(tempCanvas, 0, 0, 800, 500);

        // Capa de textura realista y sombras con mix-blend multiply
        const texImg = texturaSrc ? await cargarImg(texturaSrc) : maskImg;
        if (texImg) {
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(texImg, 0, 0, 800, 500);
            ctx.globalCompositeOperation = 'source-over';
        }
    };

    // Procesar cada prenda según su módulo activo con texturas web optimizadas
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

    // Capa de logos Fabric.js (si el usuario agregó logos)
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
                if (elLogos) {
                    ctx.drawImage(elLogos, 0, 0, 800, 500);
                }
            }
        } catch (eLogo) {
            console.warn('Aviso: no se pudo estampar logos en la captura:', eLogo);
        }
    }

    // Pie de página institucional Levalier
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

// Escuchador universal de los botones de presupuesto WhatsApp
document.querySelectorAll('.btn-presupuesto-whatsapp').forEach(btn => {
    btn.addEventListener('click', async function(e) {
        if (e) e.preventDefault();

        const textoOriginal = btn.innerHTML;
        btn.innerHTML = '<span class="icono-ws-btn">⏳</span><span class="txt-ws-principal" style="padding-top:4px;">Preparando WhatsApp...</span>';
        btn.style.pointerEvents = 'none';

        try {
            const { prenda, modelo, colores } = obtenerDetallesPrendaActiva();
            const nombreArchivo = `Disenio_Levalier_${prenda.replace(/\s+/g, '_')}.png`;

            // Intentar generar captura del canvas
            let canvasCaptura = null;
            let dataUrl = null;

            try {
                canvasCaptura = await generarCapturaDisenio();
                if (canvasCaptura) {
                    try {
                        dataUrl = canvasCaptura.toDataURL('image/png');
                    } catch (eTaint) {
                        console.warn('Canvas export restringido en este navegador:', eTaint);
                    }
                }
            } catch (errGen) {
                console.warn('Aviso en generación de imagen:', errGen);
            }

            // Descargar imagen automáticamente si se pudo generar
            if (dataUrl) {
                try {
                    const enlaceDescarga = document.createElement('a');
                    enlaceDescarga.download = nombreArchivo;
                    enlaceDescarga.href = dataUrl;
                    document.body.appendChild(enlaceDescarga);
                    enlaceDescarga.click();
                    document.body.removeChild(enlaceDescarga);
                } catch (eDescarga) {
                    console.warn('Descarga automática omitida por el navegador:', eDescarga);
                }

                if (navigator.clipboard && window.ClipboardItem && canvasCaptura) {
                    try {
                        canvasCaptura.toBlob((blob) => {
                            if (blob) {
                                navigator.clipboard.write([
                                    new ClipboardItem({ 'image/png': blob })
                                ]).catch(() => {});
                            }
                        }, 'image/png');
                    } catch (eClip) {
                        // Portapapeles no soportado sin foco directo
                    }
                }
            }

            // Preparar mensaje de WhatsApp pre-escrito profesional
            let textoMensaje = `¡Hola Levalier! 👋\n\nYa terminé de personalizar mi prenda en el diseñador 3D:\n• Prenda: ${prenda}`;
            if (modelo) textoMensaje += `\n• Modelo: ${modelo}`;
            if (colores && colores.length > 0) {
                textoMensaje += `\n` + colores.join('\n');
            }
            if (dataUrl) {
                textoMensaje += `\n\n¡Te adjunto la imagen de mi diseño descargada para solicitar el presupuesto de fabricación! Muchas gracias.`;
            } else {
                textoMensaje += `\n\n¡Quiero solicitar el presupuesto de fabricación para este diseño! Muchas gracias.`;
            }

            const urlWhatsApp = `https://wa.me/${WHATSAPP_LEVALIER}?text=${encodeURIComponent(textoMensaje)}`;

            // Mostrar el modal informativo
            const modal = document.getElementById('modal-presupuesto');
            const imgPreview = document.getElementById('img-preview-captura');
            const btnWsModal = document.getElementById('btn-abrir-whatsapp-modal');
            const instruccionModal = modal ? modal.querySelector('.modal-instruccion') : null;

            if (imgPreview) {
                if (dataUrl) {
                    imgPreview.src = dataUrl;
                    imgPreview.style.display = 'block';
                } else {
                    imgPreview.style.display = 'none';
                }
            }

            if (instruccionModal) {
                if (dataUrl) {
                    instruccionModal.innerHTML = 'Descargamos la imagen a tu dispositivo y <strong>la copiamos al portapapeles</strong>.';
                } else {
                    instruccionModal.innerHTML = 'Preparamos el detalle técnico de tu diseño con colores y modelo listos para cotizar.';
                }
            }

            if (btnWsModal) {
                btnWsModal.href = urlWhatsApp;
            }

            if (modal) {
                modal.classList.remove('oculto');
            }

            // ABRIR WHATSAPP DIRECTAMENTE
            // En móviles redirige de inmediato a la app de WhatsApp
            // En computadoras abre WhatsApp Web en pestaña nueva
            const esMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (esMobile) {
                window.location.href = urlWhatsApp;
            } else {
                const nuevaPestana = window.open(urlWhatsApp, '_blank');
                if (!nuevaPestana || nuevaPestana.closed || typeof nuevaPestana.closed === 'undefined') {
                    // Si el bloqueador de popups bloqueó la pestaña, modal queda visible con el botón listo
                    console.log('Popup bloqueado; enlace listo en el modal.');
                }
            }

        } catch (error) {
            console.error('Error imprevisto en presupuesto:', error);
            const { prenda, modelo } = obtenerDetallesPrendaActiva();
            const fallbackTxt = `¡Hola Levalier! 👋\n\nTerminé mi diseño de ${prenda}${modelo ? ' (' + modelo + ')' : ''} en el diseñador 3D. ¡Quisiera recibir presupuesto!`;
            window.location.href = `https://wa.me/${WHATSAPP_LEVALIER}?text=${encodeURIComponent(fallbackTxt)}`;
        } finally {
            btn.innerHTML = textoOriginal;
            btn.style.pointerEvents = 'auto';
        }
    });
});

// Cerrar modal
const btnCerrarModal = document.getElementById('btn-cerrar-modal-presupuesto');
const modalOverlay = document.getElementById('modal-presupuesto');

if (btnCerrarModal && modalOverlay) {
    btnCerrarModal.addEventListener('click', () => modalOverlay.classList.add('oculto'));
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.add('oculto');
    });
}
