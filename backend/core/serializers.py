from django.contrib.auth.hashers import make_password
from rest_framework import serializers

from .models import AppUser, AppUserRol, Categoria, Producto, Rol, UnidadMedida

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