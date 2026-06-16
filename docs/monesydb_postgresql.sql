-- Monesydb - PostgreSQL schema
-- Based on the final DER proposed for the Monesy minimarket system.
-- IMPORTANT:
-- In pgAdmin Query Tool, run CREATE DATABASE separately, not together with the schema.
-- Current table schema lives in monesydb_schema_only.sql.
-- If you already created the previous schema, run monesydb_v2_1_changes.sql.

-- Create the database first from a superuser or a user with CREATEDB privilege.
-- If you already created Monesydb, skip this block and run monesydb_schema_only.sql instead.
CREATE DATABASE "Monesydb"
    WITH
    ENCODING = 'UTF8'
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TEMPLATE = template0;

-- Connect to the database in psql with:
-- \c Monesydb

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

-- Using app_user instead of "user" to avoid conflicts with reserved words.
CREATE TABLE app_user (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    precio_venta        NUMERIC(12,2) NOT NULL CHECK (precio_venta >= 0),
    precio_compra_ref   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (precio_compra_ref >= 0),
    stock_actual        INTEGER NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo        INTEGER NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE venta (
    id                  BIGSERIAL PRIMARY KEY,
    cliente_id          BIGINT REFERENCES cliente(id) ON UPDATE CASCADE ON DELETE SET NULL,
    cajero_id           BIGINT NOT NULL REFERENCES app_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
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
    subtotal            NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    CONSTRAINT uq_detalle_venta UNIQUE (venta_id, producto_id)
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
CREATE INDEX idx_producto_activo ON producto(activo);
CREATE INDEX idx_producto_stock_actual ON producto(stock_actual);

CREATE INDEX idx_venta_cliente_id ON venta(cliente_id);
CREATE INDEX idx_venta_cajero_id ON venta(cajero_id);
CREATE INDEX idx_venta_fecha ON venta(fecha);

CREATE INDEX idx_detalle_venta_venta_id ON detalle_venta(venta_id);
CREATE INDEX idx_detalle_venta_producto_id ON detalle_venta(producto_id);

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

-- =========================
-- TRIGGERS / FUNCTIONS
-- =========================

CREATE OR REPLACE FUNCTION validate_subtotal_detalle_venta()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subtotal <> ROUND(NEW.cantidad * NEW.precio_unitario, 2) THEN
        RAISE EXCEPTION 'detalle_venta.subtotal debe ser igual a cantidad * precio_unitario';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_subtotal_detalle_venta
BEFORE INSERT OR UPDATE ON detalle_venta
FOR EACH ROW
EXECUTE FUNCTION validate_subtotal_detalle_venta();

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
-- COMMENTS
-- =========================

COMMENT ON TABLE app_user IS 'Usuarios del sistema Monesy.';
COMMENT ON TABLE movimiento_stock IS 'Historial completo de entradas, salidas y ajustes del inventario.';
COMMENT ON COLUMN venta.cliente_id IS 'Cliente opcional para ventas rapidas de minimarket.';
COMMENT ON COLUMN producto.precio_compra_ref IS 'Precio de compra referencial actual del producto.';
COMMENT ON COLUMN movimiento_stock.referencia_tipo IS 'Origen del movimiento: venta, compra, devolucion, ajuste o anulacion.';
COMMENT ON COLUMN movimiento_stock.referencia_id IS 'ID del registro origen asociado al movimiento.';
