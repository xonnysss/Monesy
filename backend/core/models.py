from django.db import models
from django.db.models import F


class Rol(models.Model):
    id = models.SmallAutoField(primary_key=True)
    nombre = models.CharField(max_length=50, unique=True)

    class Meta:
        managed = False
        db_table = 'rol'

    def __str__(self):
        return self.nombre


class AppUser(models.Model):
    id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    password_hash = models.TextField()
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    roles = models.ManyToManyField(Rol, through='AppUserRol', related_name='users')

    class Meta:
        managed = False
        db_table = 'app_user'

    def __str__(self):
        return self.username


class AppUserRol(models.Model):
    pk = models.CompositePrimaryKey('user_id', 'rol_id')
    user = models.ForeignKey(AppUser, models.CASCADE, db_column='user_id')
    rol = models.ForeignKey(Rol, models.PROTECT, db_column='rol_id')

    class Meta:
        managed = False
        db_table = 'app_user_rol'
        unique_together = (('user', 'rol'),)

    def __str__(self):
        return f'{self.user} - {self.rol}'


class Proveedor(models.Model):
    id = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=150)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    email = models.CharField(max_length=150, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'proveedor'

    def __str__(self):
        return self.nombre


class Cliente(models.Model):
    id = models.BigAutoField(primary_key=True)
    documento = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=150)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'cliente'

    def __str__(self):
        return self.nombre


class UnidadMedida(models.Model):
    id = models.SmallAutoField(primary_key=True)
    nombre = models.CharField(max_length=50, unique=True)
    simbolo = models.CharField(max_length=10)

    class Meta:
        managed = False
        db_table = 'unidad_medida'

    def __str__(self):
        return self.simbolo


class Categoria(models.Model):
    id = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=120, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'categoria'

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    id = models.BigAutoField(primary_key=True)
    codigo = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=180)
    categoria = models.ForeignKey(Categoria, models.PROTECT, db_column='categoria_id')
    unidad_medida = models.ForeignKey(UnidadMedida, models.PROTECT, db_column='unidad_medida_id')
    precio_venta = models.DecimalField(max_digits=12, decimal_places=2)
    precio_compra_ref = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    stock_actual = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=0)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'producto'

    def __str__(self):
        return f'{self.codigo} - {self.nombre}'


class HistorialPrecio(models.Model):
    TIPO_VENTA = 'VENTA'
    TIPO_COMPRA = 'COMPRA'
    TIPO_CHOICES = (
        (TIPO_VENTA, 'Venta'),
        (TIPO_COMPRA, 'Compra'),
    )

    id = models.BigAutoField(primary_key=True)
    producto = models.ForeignKey(Producto, models.PROTECT, db_column='producto_id')
    usuario = models.ForeignKey(AppUser, models.PROTECT, db_column='usuario_id')
    precio_anterior = models.DecimalField(max_digits=12, decimal_places=2)
    precio_nuevo = models.DecimalField(max_digits=12, decimal_places=2)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    cambiado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'historial_precio'

    def __str__(self):
        return f'{self.producto} {self.tipo}: {self.precio_anterior} -> {self.precio_nuevo}'


class TurnoCaja(models.Model):
    id = models.BigAutoField(primary_key=True)
    usuario = models.ForeignKey(AppUser, models.PROTECT, db_column='usuario_id')
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(blank=True, null=True)
    monto_inicial = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    monto_final_real = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    monto_final_sistema = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    diferencia = models.GeneratedField(
        expression=F('monto_final_real') - F('monto_final_sistema'),
        output_field=models.DecimalField(max_digits=12, decimal_places=2),
        db_persist=True,
    )
    observacion = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'turno_caja'

    def __str__(self):
        return f'Turno {self.id} - {self.usuario}'


class Venta(models.Model):
    EFECTIVO = 'EFECTIVO'
    QR = 'QR'
    TARJETA = 'TARJETA'
    TRANSFERENCIA = 'TRANSFERENCIA'
    OTRO = 'OTRO'
    METODO_PAGO_CHOICES = (
        (EFECTIVO, 'Efectivo'),
        (QR, 'QR'),
        (TARJETA, 'Tarjeta'),
        (TRANSFERENCIA, 'Transferencia'),
        (OTRO, 'Otro'),
    )

    id = models.BigAutoField(primary_key=True)
    cliente = models.ForeignKey(Cliente, models.SET_NULL, db_column='cliente_id', blank=True, null=True)
    cajero = models.ForeignKey(AppUser, models.PROTECT, db_column='cajero_id', related_name='ventas')
    turno = models.ForeignKey(TurnoCaja, models.SET_NULL, db_column='turno_id', blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)
    metodo_pago = models.CharField(max_length=20, choices=METODO_PAGO_CHOICES)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    monto_recibido = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cambio = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        managed = False
        db_table = 'venta'

    def __str__(self):
        return f'Venta {self.id} - {self.total}'


class DetalleVenta(models.Model):
    id = models.BigAutoField(primary_key=True)
    venta = models.ForeignKey(Venta, models.CASCADE, db_column='venta_id', related_name='detalles')
    producto = models.ForeignKey(Producto, models.PROTECT, db_column='producto_id')
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    descuento_unitario = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'detalle_venta'
        unique_together = (('venta', 'producto'),)

    def __str__(self):
        return f'{self.venta} - {self.producto}'


class Devolucion(models.Model):
    id = models.BigAutoField(primary_key=True)
    venta = models.ForeignKey(Venta, models.PROTECT, db_column='venta_id')
    usuario = models.ForeignKey(AppUser, models.PROTECT, db_column='usuario_id')
    fecha = models.DateTimeField(auto_now_add=True)
    motivo = models.TextField(blank=True, null=True)
    total_devuelto = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'devolucion'

    def __str__(self):
        return f'Devolucion {self.id} - {self.total_devuelto}'


class DetalleDevolucion(models.Model):
    id = models.BigAutoField(primary_key=True)
    devolucion = models.ForeignKey(Devolucion, models.CASCADE, db_column='devolucion_id', related_name='detalles')
    producto = models.ForeignKey(Producto, models.PROTECT, db_column='producto_id')
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'detalle_devolucion'
        unique_together = (('devolucion', 'producto'),)

    def __str__(self):
        return f'{self.devolucion} - {self.producto}'


class Compra(models.Model):
    id = models.BigAutoField(primary_key=True)
    proveedor = models.ForeignKey(Proveedor, models.PROTECT, db_column='proveedor_id')
    usuario = models.ForeignKey(AppUser, models.PROTECT, db_column='usuario_id')
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'compra'

    def __str__(self):
        return f'Compra {self.id} - {self.proveedor}'


class DetalleCompra(models.Model):
    id = models.BigAutoField(primary_key=True)
    compra = models.ForeignKey(Compra, models.CASCADE, db_column='compra_id', related_name='detalles')
    producto = models.ForeignKey(Producto, models.PROTECT, db_column='producto_id')
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'detalle_compra'
        unique_together = (('compra', 'producto'),)

    def __str__(self):
        return f'{self.compra} - {self.producto}'


class MovimientoStock(models.Model):
    VENTA = 'VENTA'
    COMPRA = 'COMPRA'
    AJUSTE_MANUAL = 'AJUSTE_MANUAL'
    DEVOLUCION = 'DEVOLUCION'
    ANULACION = 'ANULACION'
    TIPO_CHOICES = (
        (VENTA, 'Venta'),
        (COMPRA, 'Compra'),
        (AJUSTE_MANUAL, 'Ajuste manual'),
        (DEVOLUCION, 'Devolucion'),
        (ANULACION, 'Anulacion'),
    )

    id = models.BigAutoField(primary_key=True)
    producto = models.ForeignKey(Producto, models.PROTECT, db_column='producto_id')
    usuario = models.ForeignKey(AppUser, models.PROTECT, db_column='usuario_id')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    cantidad = models.IntegerField()
    stock_anterior = models.IntegerField()
    stock_nuevo = models.IntegerField()
    fecha = models.DateTimeField(auto_now_add=True)
    referencia_tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, blank=True, null=True)
    referencia_id = models.BigIntegerField(blank=True, null=True)
    observacion = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'movimiento_stock'

    def __str__(self):
        return f'{self.producto} - {self.tipo} - {self.cantidad}'
