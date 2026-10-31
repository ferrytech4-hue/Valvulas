-- ============================================================================
-- SISTEMA INTEGRAL DE CONTROL DE CALIDAD DE VÁLVULAS PGP 2026
-- Esquema Oficial PostgreSQL / On-Premise / Servidor Local
-- Version: 1.0.0 (Migración Reversible)
-- ============================================================================

-- Extensiones recomendadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. TABLA: usuarios y roles (RBAC)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('ADMINISTRADOR', 'REVISOR_QAQC', 'INSPECTOR_ITO', 'OPERADOR_TALLER', 'CONSULTA')),
    cargo VARCHAR(150),
    organizacion VARCHAR(150) DEFAULT 'PGP 2026',
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. TABLA: valvulas (Maestro de Válvulas PGP 2026)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS valvulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag VARCHAR(100) NOT NULL UNIQUE,
    ot VARCHAR(100) NOT NULL,
    tipo_valvula VARCHAR(50) NOT NULL CHECK (tipo_valvula IN ('Compuerta', 'Globo', 'Bola', 'Retencion', 'Mariposa', 'Seguridad_PSV', 'Macho_Plug', 'Diafragma', 'Aguja')),
    marca VARCHAR(150) NOT NULL,
    modelo VARCHAR(150) NOT NULL,
    diametro_nominal VARCHAR(50) NOT NULL,
    clase_rating VARCHAR(50) NOT NULL,
    tipo_conexion VARCHAR(50) NOT NULL,
    material_cuerpo VARCHAR(150) NOT NULL,
    material_asiento VARCHAR(150) NOT NULL,
    material_trim VARCHAR(150) NOT NULL,
    cv NUMERIC(12, 3),
    peso_kg NUMERIC(10, 2),
    presion_diseno_bar NUMERIC(10, 2),
    temp_diseno_c NUMERIC(8, 2),
    area_planta VARCHAR(150) NOT NULL,
    sistema VARCHAR(150) NOT NULL,
    ubicacion_fisica VARCHAR(255) NOT NULL,
    estado_qaqc VARCHAR(50) NOT NULL DEFAULT 'RECEPCION' CHECK (estado_qaqc IN (
        'RECEPCION', 'PRUEBA_PENDIENTE', 'EN_PRUEBAS', 'NO_CONFORME',
        'PUNCH_LIST_ABIERTO', 'LIBERADA_QAQC', 'APROBADA_ITO', 'ENTREGADA_FAENA'
    )),
    inspector_ito VARCHAR(150) NOT NULL,
    responsable_taller VARCHAR(150) NOT NULL,
    fecha_recepcion DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_liberacion DATE,
    numero_certificado VARCHAR(100),
    observaciones TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(150) NOT NULL DEFAULT 'SYSTEM'
);

-- Índices de alto rendimiento para búsquedas y filtros
CREATE INDEX IF NOT EXISTS idx_valvulas_tag ON valvulas(tag);
CREATE INDEX IF NOT EXISTS idx_valvulas_ot ON valvulas(ot);
CREATE INDEX IF NOT EXISTS idx_valvulas_estado ON valvulas(estado_qaqc);
CREATE INDEX IF NOT EXISTS idx_valvulas_area_sistema ON valvulas(area_planta, sistema);

-- ----------------------------------------------------------------------------
-- 3. TABLA: pruebas_hidraulicas (Ensayos API 598 / ISO 5208)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pruebas_hidraulicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    valvula_id UUID NOT NULL REFERENCES valvulas(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    ot VARCHAR(100) NOT NULL,
    numero_protocolo VARCHAR(100) NOT NULL UNIQUE,
    fecha_ensayo DATE NOT NULL DEFAULT CURRENT_DATE,
    norma_aplicable VARCHAR(50) NOT NULL DEFAULT 'API 598',
    fluido_prueba VARCHAR(100) NOT NULL DEFAULT 'Agua Tratada con Inhibidor',
    temp_fluido_c NUMERIC(5, 2) NOT NULL DEFAULT 20.0,
    manometro_id VARCHAR(100) NOT NULL,
    manometro_calibracion_vigente DATE NOT NULL,
    
    -- Prueba de Carcasa (Shell Test)
    presion_carcasa_requerida_bar NUMERIC(10, 2) NOT NULL,
    presion_carcasa_aplicada_bar NUMERIC(10, 2) NOT NULL,
    tiempo_carcasa_seg INTEGER NOT NULL,
    resultado_carcasa VARCHAR(20) NOT NULL CHECK (resultado_carcasa IN ('APROBADO', 'RECHAZADO')),
    obs_carcasa TEXT,
    
    -- Prueba de Asiento Alta Presión (High Pressure Closure)
    presion_asiento_hp_requerida_bar NUMERIC(10, 2) NOT NULL,
    presion_asiento_hp_aplicada_bar NUMERIC(10, 2) NOT NULL,
    tiempo_asiento_hp_seg INTEGER NOT NULL,
    fuga_admisible_asiento VARCHAR(100) NOT NULL,
    fuga_medida_asiento VARCHAR(100) NOT NULL,
    resultado_asiento_hp VARCHAR(20) NOT NULL CHECK (resultado_asiento_hp IN ('APROBADO', 'RECHAZADO')),
    
    -- Prueba de Asiento Baja Presión (Low Pressure Air Seat)
    presion_asiento_lp_bar NUMERIC(10, 2) NOT NULL DEFAULT 6.0,
    fuga_medida_lp_burbujas_min INTEGER NOT NULL DEFAULT 0,
    resultado_asiento_lp VARCHAR(20) NOT NULL CHECK (resultado_asiento_lp IN ('APROBADO', 'RECHAZADO')),
    
    -- Contrasello (Backseat)
    aplica_contrasello BOOLEAN NOT NULL DEFAULT false,
    presion_contrasello_bar NUMERIC(10, 2),
    resultado_contrasello VARCHAR(20) NOT NULL DEFAULT 'NO_APLICA' CHECK (resultado_contrasello IN ('APROBADO', 'RECHAZADO', 'NO_APLICA')),
    
    -- Veredicto General
    resultado_general VARCHAR(20) NOT NULL CHECK (resultado_general IN ('APROBADO', 'RECHAZADO', 'EN_OBSERVACION')),
    inspector_ejecutor VARCHAR(150) NOT NULL,
    inspector_ito_validador VARCHAR(150) NOT NULL,
    firma_ito BOOLEAN NOT NULL DEFAULT false,
    fecha_firma_ito TIMESTAMPTZ,
    observaciones TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pruebas_valvula_id ON pruebas_hidraulicas(valvula_id);
CREATE INDEX IF NOT EXISTS idx_pruebas_tag ON pruebas_hidraulicas(tag);

-- ----------------------------------------------------------------------------
-- 4. TABLA: punch_list (Desviaciones y No Conformidades)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS punch_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    valvula_id UUID NOT NULL REFERENCES valvulas(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    ot VARCHAR(100) NOT NULL,
    codigo_item VARCHAR(50) NOT NULL,
    tipo_desviacion VARCHAR(30) NOT NULL CHECK (tipo_desviacion IN ('TIPO_A_CRITICO', 'TIPO_B_MAYOR', 'TIPO_C_MENOR')),
    categoria VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    accion_correctiva TEXT NOT NULL,
    responsable VARCHAR(150) NOT NULL,
    fecha_deteccion DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_limite DATE NOT NULL,
    fecha_cierre DATE,
    estado VARCHAR(30) NOT NULL DEFAULT 'ABIERTA' CHECK (estado IN ('ABIERTA', 'EN_CORRECCION', 'VERIFICADA_ITO', 'CERRADA')),
    verificado_por_ito VARCHAR(150),
    evidencia_foto_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_punch_valvula ON punch_list(valvula_id);
CREATE INDEX IF NOT EXISTS idx_punch_estado ON punch_list(estado);

-- ----------------------------------------------------------------------------
-- 5. TABLA: adjuntos (Documentos y Archivos Técnicos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS adjuntos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entidad_tipo VARCHAR(50) NOT NULL CHECK (entidad_tipo IN ('valvula', 'prueba_hidraulica', 'punch_list', 'ot')),
    entidad_id VARCHAR(100) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    tamano_bytes BIGINT NOT NULL,
    subido_por VARCHAR(150) NOT NULL,
    fecha_subida TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    hash_sha256 VARCHAR(64) NOT NULL,
    url_almacenamiento TEXT
);

CREATE INDEX IF NOT EXISTS idx_adjuntos_entidad ON adjuntos(entidad_tipo, entidad_id);
CREATE INDEX IF NOT EXISTS idx_adjuntos_tag ON adjuntos(tag);

-- ----------------------------------------------------------------------------
-- 6. TABLA: historial_importaciones (Auditoría de Carga de Matrices Excel)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historial_importaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    nombre_archivo VARCHAR(255) NOT NULL,
    tamano_bytes BIGINT NOT NULL,
    total_filas INTEGER NOT NULL,
    filas_insertadas INTEGER NOT NULL,
    filas_actualizadas INTEGER NOT NULL,
    filas_omitidas INTEGER NOT NULL,
    filas_rechazadas INTEGER NOT NULL,
    usuario VARCHAR(150) NOT NULL,
    detalles_json JSONB
);

-- ----------------------------------------------------------------------------
-- 7. TABLA: auditoria_cambios (Log Inmutable de Trazabilidad)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auditoria_cambios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    usuario VARCHAR(150) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    entidad_id VARCHAR(100) NOT NULL,
    tag VARCHAR(100),
    cambios JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auditoria_tag ON auditoria_cambios(tag);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria_cambios(timestamp DESC);

-- ----------------------------------------------------------------------------
-- Regla de Negocio: Bloqueo de liberación QA/QC si existen Punch Items Tipo A
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_check_liberacion_valvula()
RETURNS TRIGGER AS $$
DECLARE
    v_punch_critico INTEGER;
BEGIN
    IF NEW.estado_qaqc IN ('LIBERADA_QAQC', 'APROBADA_ITO', 'ENTREGADA_FAENA') THEN
        SELECT COUNT(*) INTO v_punch_critico
        FROM punch_list
        WHERE valvula_id = NEW.id
          AND tipo_desviacion = 'TIPO_A_CRITICO'
          AND estado != 'CERRADA';
        
        IF v_punch_critico > 0 THEN
            RAISE EXCEPTION 'No es posible liberar la válvula %: Existen % observaciones Punch List críticas (Tipo A) pendientes.', NEW.tag, v_punch_critico;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_liberacion ON valvulas;
CREATE TRIGGER trg_check_liberacion
BEFORE UPDATE OF estado_qaqc ON valvulas
FOR EACH ROW
EXECUTE FUNCTION fn_check_liberacion_valvula();
