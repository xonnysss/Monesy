-- Monesydb - Schema only
-- Run this file while connected to the existing database: Monesydb

-- =========================
-- ENUMS
-- =========================

CREATE TYPE payment_method_enum AS ENUM (
    'EFECTIVO',
    'QR',
    'TARJETA',
    'TRANSFERENCIA',
    'OTRO'
);

CREATE TYPE stock_movement_type_enum AS ENUM (
    'VENTA',
    'COMPRA',
    'AJUSTE_MANUAL',
    'DEVOLUCION',
    'ANULACION'
);

CREATE TYPE stock_reference_type_enum AS ENUM (
    'VENTA',
    'COMPRA',
    'AJUSTE_MANUAL',
    'DEVOLUCION',
    'ANULACION'
);

-- =========================
-- TABLES
-- =========================

CREATE TABLE rol (
    id              SMALLSERIAL PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE app_user (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app_user_rol (
    user_id         BIGINT NOT NULL REFERENCES app_user(id) ON UPDATE CASCADE ON DELETE CASCADE,
    rol_id          SMALLINT NOT NULL REFERENCES rol(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    PRIMARY KEY (user_id, rol_id)
);

CREATE TABLE proveedor (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    telefono        VARCHAR(30),
    email           VARCHAR(150),
    direccion       TEXT,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cliente (
    id              BIGSERIAL PRIMARY KEY,
    documento       VARCHAR(50) NOT NULL UNIQUE,
    nombre          VARCHAR(150) NOT NULL,
    telefono        VARCHAR(30),
    created_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE unidad_medida (
    id              SMALLSERIAL PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL UNIQUE,
    simbolo         VARCHAR(10) NOT NULL
);

CREATE TABLE categoria (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(120) NOT NULL UNIQUE,
    created_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE producto (
    id                  BIGSERIAL PRIMARY KEY,
    codigo              VARCHAR(50) NOT NULL UNIQUE,
    nombre              VARCHAR(180) NOT NULL,
    categoria_id        BIGINT NOT NULL REFERENCES categoria(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    unidad_medida_id    SMALLINT NOT NULL REFERENCES unidad_medida(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    precio_venta        NUMERIC(12,2) NOT NULL CHECK (precio_venta >= 0),
    precio_compra_ref   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (precio_compra_ref >= 0),
    stock_actual        INTEGER NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo        INTEGER NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historial_precio (
    id                  BIGSERIAL PRIMARY KEY,
    producto_id         BIGINT NOT NULL REFERENCES producto(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    usuario_id          BIGINT NOT NULL REFERENCES app_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    precio_anterior     NUMERIC(12,2) NOT NULL CHECK (precio_anterior >= 0),
    precio_nuevo        NUMERIC(12,2) NOT NULL CHECK (precio_nuevo >= 0),
    tipo                VARCHAR(20) NOT NULL CHECK (tipo IN ('VENTA','COMPRA')),
    cambiado_en         TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE turno_caja (
    id                      BIGSERIAL PRIMARY KEY,
    usuario_id              BIGINT NOT NULL REFERENCES app_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    fecha_apertura          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre            TIMESTAMP WITHOUT TIME ZONE,
    monto_inicial           NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (monto_inicial >= 0),
    monto_final_real        NUMERIC(12,2) CHECK (monto_final_real >= 0),
    monto_final_sistema     NUMERIC(12,2) CHECK (monto_final_sistema >= 0),
    diferencia              NUMERIC(12,2) GENERATED ALWAYS AS (monto_final_real - monto_final_sistema) STORED,
    observacion             TEXT,
    CONSTRAINT chk_turno_fechas CHECK (fecha_cierre IS NULL OR fecha_cierre >= fecha_apertura)
);

CREATE TABLE venta (
    id                  BIGSERIAL PRIMARY KEY,
    cliente_id          BIGINT REFERENCES cliente(id) ON UPDATE CASCADE ON DELETE SET NULL,
    cajero_id           BIGINT NOT NULL REFERENCES app_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    turno_id            BIGINT REFERENCES turno_caja(id) ON UPDATE CASCADE ON DELETE SET NULL,
    fecha               TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metodo_pago         payment_method_enum NOT NULL,
    total               NUMERIC(12,2) NOT NULL CHECK (total >= 0),
    monto_recibido      NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (monto_recibido >= 0),
    cambio              NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (cambio >= 0)
);

CREATE TABLE detalle_venta (
    id                  BIGSERIAL PRIMARY KEY,
    venta_id            BIGINT NOT NULL REFERENCES venta(id) ON UPDATE CASCADE ON DELETE CASCADE,
    producto_id         BIGINT NOT NULL REFERENCES producto(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    cantidad            INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario     NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),
    descuento_unitario  NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (descuento_unitario >= 0),
    subtotal            NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    CONSTRAINT chk_detalle_venta_descuento CHECK (descuento_unitario <= precio_unitario),
    CONSTRAINT uq_detalle_venta UNIQUE (venta_id, producto_id)
);

CREATE TABLE devolucion (
    id                  BIGSERIAL PRIMARY KEY,
    venta_id            BIGINT NOT NULL REFERENCES venta(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    usuario_id          BIGINT NOT NULL REFERENCES app_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    fecha               TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motivo              TEXT,
    total_devuelto      NUMERIC(12,2) NOT NULL CHECK (total_devuelto >= 0)
);

CREATE TABLE detalle_devolucion (
    id                  BIGSERIAL PRIMARY KEY,
    devolucion_id       BIGINT NOT NULL REFERENCES devolucion(id) ON UPDATE CASCADE ON DELETE CASCADE,
    producto_id         BIGINT NOT NULL REFERENCES producto(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    cantidad            INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario     NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal            NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    CONSTRAINT uq_detalle_devolucion UNIQUE (devolucion_id, producto_id)
);

CREATE TABLE compra (
    id                  BIGSERIAL PRIMARY KEY,
    proveedor_id        BIGINT NOT NULL REFERENCES proveedor(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    usuario_id          BIGINT NOT NULL REFERENCES app_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    fecha               TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total               NUMERIC(12,2) NOT NULL CHECK (total >= 0)
);

CREATE TABLE detalle_compra (
    id                  BIGSERIAL PRIMARY KEY,
    compra_id           BIGINT NOT NULL REFERENCES compra(id) ON UPDATE CASCADE ON DELETE CASCADE,
    producto_id         BIGINT NOT NULL REFERENCES producto(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    cantidad            INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario     NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal            NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    CONSTRAINT uq_detalle_compra UNIQUE (compra_id, producto_id)
);

CREATE TABLE movimiento_stock (
    id                  BIGSERIAL PRIMARY KEY,
    producto_id         BIGINT NOT NULL REFERENCES producto(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    usuario_id          BIGINT NOT NULL REFERENCES app_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    tipo                stock_movement_type_enum NOT NULL,
    cantidad            INTEGER NOT NULL CHECK (cantidad > 0),
    stock_anterior      INTEGER NOT NULL CHECK (stock_anterior >= 0),
    stock_nuevo         INTEGER NOT NULL CHECK (stock_nuevo >= 0),
    fecha               TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    referencia_tipo     stock_reference_type_enum,
    referencia_id       BIGINT,
    observacion         TEXT
);

-- =========================
-- INDEXES
-- =========================

CREATE INDEX idx_producto_categoria_id ON producto(categoria_id);
CREATE INDEX idx_producto_unidad_medida_id ON producto(unidad_medida_id);
CREATE INDEX idx_producto_activo ON producto(activo);
CREATE INDEX idx_producto_stock_actual ON producto(stock_actual);

CREATE INDEX idx_venta_cliente_id ON venta(cliente_id);
CREATE INDEX idx_venta_cajero_id ON venta(cajero_id);
CREATE INDEX idx_venta_turno_id ON venta(turno_id);
CREATE INDEX idx_venta_fecha ON venta(fecha);

CREATE INDEX idx_detalle_venta_venta_id ON detalle_venta(venta_id);
CREATE INDEX idx_detalle_venta_producto_id ON detalle_venta(producto_id);

CREATE INDEX idx_devolucion_venta_id ON devolucion(venta_id);
CREATE INDEX idx_devolucion_usuario_id ON devolucion(usuario_id);
CREATE INDEX idx_devolucion_fecha ON devolucion(fecha);
CREATE INDEX idx_detalle_devolucion_devolucion_id ON detalle_devolucion(devolucion_id);
CREATE INDEX idx_detalle_devolucion_producto_id ON detalle_devolucion(producto_id);

CREATE INDEX idx_compra_proveedor_id ON compra(proveedor_id);
CREATE INDEX idx_compra_usuario_id ON compra(usuario_id);
CREATE INDEX idx_compra_fecha ON compra(fecha);

CREATE INDEX idx_detalle_compra_compra_id ON detalle_compra(compra_id);
CREATE INDEX idx_detalle_compra_producto_id ON detalle_compra(producto_id);

CREATE INDEX idx_movimiento_stock_producto_id ON movimiento_stock(producto_id);
CREATE INDEX idx_movimiento_stock_usuario_id ON movimiento_stock(usuario_id);
CREATE INDEX idx_movimiento_stock_tipo ON movimiento_stock(tipo);
CREATE INDEX idx_movimiento_stock_fecha ON movimiento_stock(fecha);
CREATE INDEX idx_movimiento_stock_referencia ON movimiento_stock(referencia_tipo, referencia_id);

CREATE INDEX idx_app_user_rol_user_id ON app_user_rol(user_id);
CREATE INDEX idx_app_user_rol_rol_id ON app_user_rol(rol_id);
CREATE INDEX idx_turno_caja_usuario_id ON turno_caja(usuario_id);
CREATE INDEX idx_turno_caja_fecha_apertura ON turno_caja(fecha_apertura);
CREATE INDEX idx_historial_precio_producto_id ON historial_precio(producto_id);
CREATE INDEX idx_historial_precio_usuario_id ON historial_precio(usuario_id);
CREATE INDEX idx_historial_precio_cambiado_en ON historial_precio(cambiado_en);

-- =========================
-- TRIGGERS / FUNCTIONS
-- =========================

CREATE OR REPLACE FUNCTION validate_subtotal_detalle_venta()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subtotal <> ROUND(NEW.cantidad * (NEW.precio_unitario - NEW.descuento_unitario), 2) THEN
        RAISE EXCEPTION 'detalle_venta.subtotal debe ser igual a cantidad * (precio_unitario - descuento_unitario)';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_subtotal_detalle_venta
BEFORE INSERT OR UPDATE ON detalle_venta
FOR EACH ROW
EXECUTE FUNCTION validate_subtotal_detalle_venta();

CREATE OR REPLACE FUNCTION validate_subtotal_detalle_devolucion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subtotal <> ROUND(NEW.cantidad * NEW.precio_unitario, 2) THEN
        RAISE EXCEPTION 'detalle_devolucion.subtotal debe ser igual a cantidad * precio_unitario';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_subtotal_detalle_devolucion
BEFORE INSERT OR UPDATE ON detalle_devolucion
FOR EACH ROW
EXECUTE FUNCTION validate_subtotal_detalle_devolucion();

CREATE OR REPLACE FUNCTION validate_subtotal_detalle_compra()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subtotal <> ROUND(NEW.cantidad * NEW.precio_unitario, 2) THEN
        RAISE EXCEPTION 'detalle_compra.subtotal debe ser igual a cantidad * precio_unitario';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_subtotal_detalle_compra
BEFORE INSERT OR UPDATE ON detalle_compra
FOR EACH ROW
EXECUTE FUNCTION validate_subtotal_detalle_compra();

CREATE OR REPLACE FUNCTION validate_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_nuevo < 0 OR NEW.stock_anterior < 0 THEN
        RAISE EXCEPTION 'El stock no puede ser negativo';
    END IF;

    IF NEW.tipo IN ('COMPRA', 'DEVOLUCION') THEN
        IF NEW.stock_nuevo <> NEW.stock_anterior + NEW.cantidad THEN
            RAISE EXCEPTION 'Movimiento de entrada invalido: stock_nuevo debe ser stock_anterior + cantidad';
        END IF;
    ELSIF NEW.tipo IN ('VENTA', 'ANULACION') THEN
        IF NEW.stock_anterior < NEW.cantidad THEN
            RAISE EXCEPTION 'No hay suficiente stock para registrar la salida';
        END IF;
        IF NEW.stock_nuevo <> NEW.stock_anterior - NEW.cantidad THEN
            RAISE EXCEPTION 'Movimiento de salida invalido: stock_nuevo debe ser stock_anterior - cantidad';
        END IF;
    ELSIF NEW.tipo = 'AJUSTE_MANUAL' THEN
        IF NEW.stock_nuevo = NEW.stock_anterior THEN
            RAISE EXCEPTION 'Un ajuste manual debe modificar el stock';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_stock_movement
BEFORE INSERT OR UPDATE ON movimiento_stock
FOR EACH ROW
EXECUTE FUNCTION validate_stock_movement();

CREATE OR REPLACE FUNCTION sync_producto_stock_actual()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE producto
    SET stock_actual = NEW.stock_nuevo
    WHERE id = NEW.producto_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_producto_stock_actual
AFTER INSERT OR UPDATE ON movimiento_stock
FOR EACH ROW
EXECUTE FUNCTION sync_producto_stock_actual();

-- =========================
-- INITIAL CATALOG DATA
-- =========================

INSERT INTO rol (nombre)
VALUES ('ADMIN'), ('CAJERO'), ('SUPERVISOR')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO unidad_medida (nombre, simbolo)
VALUES
    ('unidad', 'u'),
    ('kilogramo', 'kg'),
    ('litro', 'l'),
    ('caja', 'cj')
ON CONFLICT (nombre) DO NOTHING;
