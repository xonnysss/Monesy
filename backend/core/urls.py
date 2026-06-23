from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AppUserRolViewSet,
    AppUserViewSet,
    CategoriaViewSet,
    ClienteViewSet,
    CompraViewSet,
    DetalleCompraViewSet,
    DetalleVentaViewSet,
    DevolucionViewSet,
    DetalleDevolucionViewSet,
    MovimientoStockViewSet,
    ProductoViewSet,
    ProveedorViewSet,
    RolViewSet,
    TurnoCajaViewSet,
    UnidadMedidaViewSet,
    VentaViewSet,
)

router = DefaultRouter()
router.register(r'roles', RolViewSet, basename='roles')
router.register(r'usuarios', AppUserViewSet, basename='usuarios')
router.register(r'usuarios-roles', AppUserRolViewSet, basename='usuarios-roles')
router.register(r'productos', ProductoViewSet, basename='productos')
router.register(r'proveedores', ProveedorViewSet, basename='proveedores')
router.register(r'categorias', CategoriaViewSet, basename='categorias')
router.register(r'clientes', ClienteViewSet, basename='clientes')
router.register(r'compras', CompraViewSet, basename='compras')
router.register(r'detalles-compra', DetalleCompraViewSet, basename='detalles-compra')
router.register(r'detalles-venta', DetalleVentaViewSet, basename='detalles-venta')
router.register(r'detalles-devolucion', DetalleDevolucionViewSet, basename='detalles-devolucion')
router.register(r'devoluciones', DevolucionViewSet, basename='devoluciones')
router.register(r'movimientos-stock', MovimientoStockViewSet, basename='movimientos-stock')
router.register(r'turnos-caja', TurnoCajaViewSet, basename='turnos-caja')
router.register(r'unidades-medida', UnidadMedidaViewSet, basename='unidades-medida')
router.register(r'ventas', VentaViewSet, basename='ventas')

urlpatterns = [
    path('', include(router.urls)),
]
