from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AppUserRolViewSet,
    AppUserViewSet,
    CajaAbrirView,
    CajaCerrarView,
    CajaEstadoView,
    CategoriaViewSet,
    ClienteViewSet,
    CompraViewSet,
    DashboardResumenView,
    DetalleCompraViewSet,
    DetalleVentaViewSet,
    DevolucionViewSet,
    DetalleDevolucionViewSet,
    MovimientoStockViewSet,
    ProductoViewSet,
    HistorialPrecioViewSet,
    InventarioResumenView,
    ProveedorViewSet,
    RolViewSet,
    ReportesResumenView,
    TurnoCajaViewSet,
    UnidadMedidaViewSet,
    UsuarioActualView,
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
router.register(r'historiales-precio', HistorialPrecioViewSet, basename='historiales-precio')
router.register(r'movimientos-stock', MovimientoStockViewSet, basename='movimientos-stock')
router.register(r'turnos-caja', TurnoCajaViewSet, basename='turnos-caja')
router.register(r'unidades-medida', UnidadMedidaViewSet, basename='unidades-medida')
router.register(r'ventas', VentaViewSet, basename='ventas')

urlpatterns = [
    path('auth/me/', UsuarioActualView.as_view(), name='usuario-actual'),
    path(
        'dashboard/resumen/',
        DashboardResumenView.as_view(),
        name='dashboard-resumen',
    ),
    path(
        'inventario/resumen/',
        InventarioResumenView.as_view(),
        name='inventario-resumen',
    ),
    path('caja/estado/', CajaEstadoView.as_view(), name='caja-estado'),
    path('caja/abrir/', CajaAbrirView.as_view(), name='caja-abrir'),
    path('caja/cerrar/', CajaCerrarView.as_view(), name='caja-cerrar'),
    path(
        'reportes/resumen/',
        ReportesResumenView.as_view(),
        name='reportes-resumen',
    ),
    path('', include(router.urls)),
]
