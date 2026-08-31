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
document.querySelectorAll('.pickr-contenedor').forEach(contenedor => {
    const targetId = contenedor.getAttribute('data-target');
    const colorPorDefecto = contenedor.getAttribute('data-default') || '#ffffff';
    const inputOculto = document.getElementById(targetId);

    const pickr = Pickr.create({
        el: contenedor,
        theme: 'classic',
        default: colorPorDefecto,
        swatches: ['#ffffff', '#1a1e29', '#e32627', '#0055ff', '#f09433', '#25D366', '#000000'],
        components: {
            preview: true, opacity: false, hue: true, 
            interaction: { hex: true, input: true, clear: false, save: false }
        }
    });

    pickr.on('change', (color, source, instance) => {
        const colorHex = color.toHEXA().toString();
        if (inputOculto) {
            inputOculto.value = colorHex;
            inputOculto.dispatchEvent(new Event('input')); 
        }
        instance.applyColor(true); 
    });
});

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


// ==========================================
// 4. LÓGICAS ESPECÍFICAS POR PRENDA
// ==========================================

// --- REMERA (Patrones) ---
const tarjetasModelo = document.querySelectorAll('.tarjeta-modelo');
let modeloActualGlobal = 'liso'; 
const patronMitadFrente = document.getElementById('patron-mitad-frente');
const patronMitadEspalda = document.getElementById('patron-mitad-espalda');
const patronRayasFrente = document.getElementById('patron-rayas-frente');
const patronRayasEspalda = document.getElementById('patron-rayas-espalda');
const contenedorColor2 = document.getElementById('contenedor-color-2');
const contenedorSlider = document.getElementById('contenedor-slider'); 
const sliderMitad = document.getElementById('slider-mitad');
const sliderRayas = document.getElementById('slider-rayas');
const labelColor1 = document.getElementById('label-color-1');
const labelColor2 = document.getElementById('label-color-2');
const labelSlider = document.getElementById('label-slider');
const selectorPatron = document.getElementById('selector-patron');

function actualizarPatrones() {
    if(!selectorPatron) return;
    const colorSecundario = selectorPatron.value; 
    
    if (modeloActualGlobal === 'mitad') {
        const valorMitad = sliderMitad.value;
        patronMitadFrente.style.backgroundColor = colorSecundario;
        patronMitadEspalda.style.backgroundColor = colorSecundario;
        patronMitadFrente.style.width = valorMitad + '%';
        patronMitadEspalda.style.width = valorMitad + '%';
    } else if (modeloActualGlobal === 'rayas') {
        const anchoRaya = sliderRayas.value; 
        const gradiente = `repeating-linear-gradient(to right, transparent, transparent ${anchoRaya}%, ${colorSecundario} ${anchoRaya}%, ${colorSecundario} ${anchoRaya * 2}%)`;
        patronRayasFrente.style.background = gradiente;
        patronRayasEspalda.style.background = gradiente;
    }
}

tarjetasModelo.forEach(tarjeta => {
    tarjeta.addEventListener('click', () => {
        tarjetasModelo.forEach(t => t.classList.remove('activa'));
        tarjeta.classList.add('activa');
        const modelo = tarjeta.getAttribute('data-modelo');
        modeloActualGlobal = modelo;
        
        patronMitadFrente.style.display = 'none'; patronMitadEspalda.style.display = 'none';
        patronRayasFrente.style.display = 'none'; patronRayasEspalda.style.display = 'none';

        if (modelo === 'mitad') {
            patronMitadFrente.style.display = 'block'; patronMitadEspalda.style.display = 'block';
            contenedorColor2.classList.remove('oculto'); contenedorSlider.classList.remove('oculto');
            sliderMitad.classList.remove('oculto'); sliderRayas.classList.add('oculto');
            labelColor1.innerText = 'Color Principal (Derecha):'; labelColor2.innerText = 'Color Secundario (Izquierda):'; labelSlider.innerText = 'Ajustar Centro del Corte:';
        } else if (modelo === 'rayas') {
            patronRayasFrente.style.display = 'block'; patronRayasEspalda.style.display = 'block';
            contenedorColor2.classList.remove('oculto'); contenedorSlider.classList.remove('oculto');
            sliderRayas.classList.remove('oculto'); sliderMitad.classList.add('oculto');
            labelColor1.innerText = 'Color Base:'; labelColor2.innerText = 'Color de Rayas:'; labelSlider.innerText = 'Grosor de las Rayas:';
        } else { 
            contenedorColor2.classList.add('oculto'); contenedorSlider.classList.add('oculto');
            sliderMitad.classList.add('oculto'); sliderRayas.classList.add('oculto');
            labelColor1.innerText = 'Color Principal:';
        }
        actualizarPatrones();
    });
});

if(selectorPatron) selectorPatron.addEventListener('input', actualizarPatrones);
if(sliderMitad) sliderMitad.addEventListener('input', actualizarPatrones);
if(sliderRayas) sliderRayas.addEventListener('input', actualizarPatrones);

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