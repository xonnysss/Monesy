from rest_framework import mixins, status, viewsets
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import (
AppUser, 
AppUserRol, 
Categoria, 
Cliente, 
Compra,
DetalleCompra,
DetalleVenta,
Devolucion,
DetalleDevolucion,
MovimientoStock,
Producto, 
HistorialPrecio,
Proveedor, 
Rol,
TurnoCaja, 
UnidadMedida,
Venta,
)
from .serializers import (
    AppUserRolSerializer,
    AppUserSerializer,
    CategoriaSerializer,
    ClienteSerializer,
    CompraSerializer,
    DetalleCompraSerializer,
    DetalleVentaSerializer,
    DevolucionSerializer,
    DetalleDevolucionSerializer,
    MovimientoStockSerializer,
    ProductoSerializer,
    HistorialPrecioSerializer,
    ProveedorSerializer,
    RolSerializer,
    TurnoCajaSerializer,
    UnidadMedidaSerializer,
    VentaSerializer,
)


class UsuarioActualView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        perfil = get_object_or_404(
            AppUser.objects.prefetch_related('roles'),
            django_user=request.user,
        )

        serializer = AppUserSerializer(perfil)
        return Response(serializer.data)


class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all().order_by('id')
    serializer_class = RolSerializer

    def destroy(self, request, *args, **kwargs):
        rol = self.get_object()

        if rol.users.exists():
            return Response(
                {
                    'detail': 'No se puede eliminar este rol porque hay uno o mas usuarios asignados.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().destroy(request, *args, **kwargs)


class AppUserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        AppUser.objects
        .select_related('django_user')
        .prefetch_related('roles')
        .order_by('id')
    )
    serializer_class = AppUserSerializer


class AppUserRolViewSet(viewsets.ModelViewSet):
    queryset = AppUserRol.objects.select_related('user', 'rol').all()
    serializer_class = AppUserRolSerializer


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all().order_by('id')
    serializer_class = CategoriaSerializer

    def destroy(self, request, *args, **kwargs):
        categoria = self.get_object()

        if categoria.producto_set.exists():
            return Response(
                {
                    'detail': 'No se puede eliminar esta categoria porque tiene productos asignados.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().destroy(request, *args, **kwargs)


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all().order_by('id')
    serializer_class = ClienteSerializer


class CompraViewSet(viewsets.ModelViewSet):
    queryset = Compra.objects.select_related('proveedor', 'usuario').all().order_by('id')
    serializer_class = CompraSerializer


class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.select_related('cliente', 'cajero', 'turno').all().order_by('id')
    serializer_class = VentaSerializer


class DevolucionViewSet(viewsets.ModelViewSet):
    queryset = Devolucion.objects.select_related('venta', 'usuario').all().order_by('-fecha', '-id')
    serializer_class = DevolucionSerializer


class DetalleDevolucionViewSet(viewsets.ModelViewSet):
    queryset = DetalleDevolucion.objects.select_related('devolucion', 'producto').all().order_by('id')
    serializer_class = DetalleDevolucionSerializer


class DetalleCompraViewSet(viewsets.ModelViewSet):
    queryset = DetalleCompra.objects.select_related('compra', 'producto',).all().order_by('id')
    serializer_class = DetalleCompraSerializer

class DetalleVentaViewSet(viewsets.ModelViewSet):
    queryset = DetalleVenta.objects.select_related('venta', 'producto',).all().order_by('id')
    serializer_class = DetalleVentaSerializer


class UnidadMedidaViewSet(viewsets.ModelViewSet):
    queryset = UnidadMedida.objects.all().order_by('id')
    serializer_class = UnidadMedidaSerializer

    def destroy(self, request, *args, **kwargs):
        unidad_medida = self.get_object()

        if unidad_medida.producto_set.exists():
            return Response(
                {
                    'detail': 'No se puede eliminar esta unidad de medida porque tiene productos asignados.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().destroy(request, *args, **kwargs)


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.select_related('categoria', 'unidad_medida').all().order_by('id')
    serializer_class = ProductoSerializer


class HistorialPrecioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HistorialPrecio.objects.select_related('producto', 'usuario').order_by('-cambiado_en', '-id')
    serializer_class = HistorialPrecioSerializer


class MovimientoStockViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = (
        MovimientoStock.objects
        .select_related('producto', 'usuario')
        .all()
        .order_by('-fecha', '-id')
    )
    serializer_class = MovimientoStockSerializer


class TurnoCajaViewSet(viewsets.ModelViewSet):
    queryset = TurnoCaja.objects.select_related('usuario').all().order_by('-fecha_apertura', '-id')
    serializer_class = TurnoCajaSerializer


class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all().order_by('id')
    serializer_class = ProveedorSerializer
