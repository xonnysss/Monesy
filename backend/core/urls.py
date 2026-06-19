from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AppUserRolViewSet,
    AppUserViewSet,
    CategoriaViewSet,
    ClienteViewSet,
    ProductoViewSet,
    ProveedorViewSet,
    RolViewSet,
    UnidadMedidaViewSet,
)

router = DefaultRouter()
router.register(r'roles', RolViewSet, basename='roles')
router.register(r'usuarios', AppUserViewSet, basename='usuarios')
router.register(r'usuarios-roles', AppUserRolViewSet, basename='usuarios-roles')
router.register(r'productos', ProductoViewSet, basename='productos')
router.register(r'proveedores', ProveedorViewSet, basename='proveedores')
router.register(r'categorias', CategoriaViewSet, basename='categorias')
router.register(r'Clientes', ClienteViewSet, basename='clientes')
router.register(r'unidades-medida', UnidadMedidaViewSet, basename='unidades-medida')

urlpatterns = [
    path('', include(router.urls)),
]
