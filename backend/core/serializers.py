from django.contrib.auth.hashers import make_password
from rest_framework import serializers

from .models import (
    AppUser,
    AppUserRol,
    Categoria,
    Cliente,
    Compra,
    DetalleCompra,
    DetalleVenta,
    MovimientoStock,
    Producto,
    Proveedor,
    Rol,
    TurnoCaja,
    UnidadMedida,
    Venta,
)
from .services import registrar_movimiento_stock


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'nombre']


class UnidadMedidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadMedida
        fields = ['id', 'nombre', 'simbolo']


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'created_at']
        read_only_fields = ['id', 'created_at']


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'documento', 'nombre', 'telefono', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = [
            'id',
            'nombre',
            'telefono',
            'email',
            'direccion',
            'activo',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    unidad_medida_nombre = serializers.CharField(source='unidad_medida.nombre', read_only=True)
    unidad_medida_simbolo = serializers.CharField(source='unidad_medida.simbolo', read_only=True)

    class Meta:
        model = Producto
        fields = [
            'id',
            'codigo',
            'nombre',
            'categoria',
            'categoria_nombre',
            'unidad_medida',
            'unidad_medida_nombre',
            'unidad_medida_simbolo',
            'precio_venta',
            'precio_compra_ref',
            'stock_actual',
            'stock_minimo',
            'activo',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class MovimientoStockSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    cantidad = serializers.IntegerField(required=False, min_value=1)
    stock_nuevo = serializers.IntegerField(required=False, min_value=0)
    class Meta:
        model = MovimientoStock
        fields = [
            'id',
            'producto',
            'producto_nombre',
            'usuario',
            'usuario_username',
            'tipo',
            'cantidad',
            'stock_anterior',
            'stock_nuevo',
            'fecha',
            'referencia_tipo',
            'referencia_id',
            'observacion',
        ]
        read_only_fields = [
            'id',
            'stock_anterior',
            'fecha',
        ]
    def create(self, validated_data):
        try:
            return registrar_movimiento_stock(**validated_data)
        except Exception as exc:
            raise serializers.ValidationError({'detail': str(exc)})


class TurnoCajaSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = TurnoCaja
        fields = [
            'id',
            'usuario',
            'usuario_username', 
            'fecha_apertura',
            'fecha_cierre',
            'monto_inicial',
            'monto_final_real',
            'monto_final_sistema',
            'diferencia',
            'observacion',
        ]
        read_only_fields = [
            'id',
            'fecha_apertura',
            'diferencia',
        ]


class DetalleCompraSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = DetalleCompra
        fields = [
            'id',
            'compra',
            'producto',
            'producto_nombre',
            'cantidad',
            'precio_unitario',
            'subtotal',
        ]
        read_only_fields = ['id']


class CompraSerializer(serializers.ModelSerializer):
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    detalles = DetalleCompraSerializer(many=True, read_only=True)

    class Meta:
        model = Compra
        fields = [
            'id',
            'proveedor',
            'proveedor_nombre',
            'usuario',
            'usuario_username',
            'fecha',
            'total',
            'detalles',
        ]
        read_only_fields = ['id', 'fecha', 'detalles']


class DetalleVentaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = DetalleVenta
        fields = [
            'id',
            'venta',
            'producto',
            'producto_nombre',
            'cantidad',
            'precio_unitario',
            'descuento_unitario',
            'subtotal',
        ]
        read_only_fields = ['id']


class VentaSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    cajero_username = serializers.CharField(source='cajero.username', read_only=True)
    detalles = DetalleVentaSerializer(many=True, read_only=True)

    class Meta:
        model = Venta
        fields = [
            'id',
            'cliente',
            'cliente_nombre',
            'cajero',
            'cajero_username',
            'turno',
            'fecha',
            'metodo_pago',
            'total',
            'monto_recibido',
            'cambio',
            'detalles',
        ]
        read_only_fields = ['id', 'fecha', 'detalles']


class AppUserRolSerializer(serializers.ModelSerializer):
    rol_nombre = serializers.CharField(source='rol.nombre', read_only=True)

    class Meta:
        model = AppUserRol
        fields = ['user', 'rol', 'rol_nombre']


class AppUserSerializer(serializers.ModelSerializer):
    roles = RolSerializer(many=True, read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = AppUser
        fields = [
            'id',
            'username',
            'password',
            'first_name',
            'last_name',
            'is_active',
            'created_at',
            'roles',
        ]
        read_only_fields = ['id', 'created_at', 'roles']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data['password_hash'] = make_password(password) if password else make_password(None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        if password:
            instance.password_hash = make_password(password)

        return super().update(instance, validated_data)
