from decimal import Decimal
from django.db import transaction
from rest_framework import mixins, status, viewsets
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, F, Sum
from django.db.models.expressions import RawSQL
from django.db.models.functions import Coalesce
from django.utils import timezone
from django.utils.dateparse import parse_date
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
    AperturaCajaSerializer,
    CategoriaSerializer,
    CierreCajaSerializer,
    ClienteSerializer,
    CompraSerializer,
    DashboardResumenSerializer,
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
    obtener_usuario_monesy,
)


def formatear_monto(valor):
    return f'{valor or Decimal("0.00"):.2f}'


def fecha_local_sin_zona(fecha):
    """Conserva la semantica de las columnas TIMESTAMP de Monesydb."""
    return fecha.strftime('%Y-%m-%d %H:%M:%S.%f')


def total_efectivo_turno(turno):
    ventas_efectivo = Venta.objects.filter(
        turno=turno,
        metodo_pago=Venta.EFECTIVO,
    ).aggregate(
        total=Coalesce(Sum('total'), Decimal('0.00')),
    )['total']
    devoluciones_efectivo = Devolucion.objects.filter(
        usuario=turno.usuario,
        venta__metodo_pago=Venta.EFECTIVO,
        fecha__gte=RawSQL(
            '%s::timestamp',
            [fecha_local_sin_zona(turno.fecha_apertura)],
        ),
    ).aggregate(
        total=Coalesce(Sum('total_devuelto'), Decimal('0.00')),
    )['total']

    return ventas_efectivo - devoluciones_efectivo


class UsuarioActualView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        perfil = get_object_or_404(
            AppUser.objects.prefetch_related('roles'),
            django_user=request.user,
        )

        serializer = AppUserSerializer(perfil)
        return Response(serializer.data)


class DashboardResumenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hoy = timezone.localdate()

        ventas = Venta.objects.filter(fecha__date=hoy)
        compras = Compra.objects.filter(fecha__date=hoy)

        resumen_ventas = ventas.aggregate(
            cantidad=Count('id'),
            total=Coalesce(
                Sum('total'),
                Decimal('0.00'),
            ),
        )

        resumen_compras = compras.aggregate(
            cantidad=Count('id'),
            total=Coalesce(
                Sum('total'),
                Decimal('0.00'),
            ),
        )

        resumen = {
            'fecha': hoy,
            'productos_activos': Producto.objects.filter(
                activo=True,
            ).count(),
            'productos_stock_bajo': Producto.objects.filter(
                activo=True,
                stock_actual__lte=F('stock_minimo'),
            ).count(),
            'clientes': Cliente.objects.count(),
            'ventas_hoy': resumen_ventas['cantidad'],
            'total_ventas_hoy': resumen_ventas['total'],
            'compras_hoy': resumen_compras['cantidad'],
            'total_compras_hoy': resumen_compras['total'],
            'turnos_abiertos': TurnoCaja.objects.filter(
                fecha_cierre__isnull=True,
            ).count(),
        }

        serializer = DashboardResumenSerializer(resumen)
        return Response(serializer.data)


class InventarioResumenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        productos = Producto.objects.select_related(
            'categoria',
            'unidad_medida',
        ).order_by('nombre', 'id')
        items = []
        valor_costo = Decimal('0.00')
        valor_venta = Decimal('0.00')

        for producto in productos:
            if not producto.activo:
                estado = 'INACTIVO'
            elif producto.stock_actual == 0:
                estado = 'SIN_STOCK'
            elif producto.stock_actual <= producto.stock_minimo:
                estado = 'STOCK_BAJO'
            else:
                estado = 'DISPONIBLE'

            valor_costo += (
                producto.stock_actual * producto.precio_compra_ref
            )
            valor_venta += (
                producto.stock_actual * producto.precio_venta
            )
            items.append({
                'id': producto.id,
                'codigo': producto.codigo,
                'nombre': producto.nombre,
                'categoria_nombre': producto.categoria.nombre,
                'unidad_medida_simbolo': producto.unidad_medida.simbolo,
                'stock_actual': producto.stock_actual,
                'stock_minimo': producto.stock_minimo,
                'activo': producto.activo,
                'estado': estado,
            })

        return Response({
            'total_productos': len(items),
            'productos_activos': sum(
                1 for item in items if item['activo']
            ),
            'productos_stock_bajo': sum(
                1 for item in items
                if item['estado'] in {'SIN_STOCK', 'STOCK_BAJO'}
            ),
            'valor_stock_costo': formatear_monto(valor_costo),
            'valor_stock_venta': formatear_monto(valor_venta),
            'productos': items,
        })


class CajaEstadoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = obtener_usuario_monesy({'request': request})
        turno = TurnoCaja.objects.filter(
            usuario=usuario,
            fecha_cierre__isnull=True,
        ).order_by('-fecha_apertura', '-id').first()

        if turno is None:
            return Response({
                'turno_abierto': False,
                'turno': None,
                'monto_esperado': '0.00',
            })

        monto_esperado = turno.monto_inicial + total_efectivo_turno(turno)
        return Response({
            'turno_abierto': True,
            'turno': TurnoCajaSerializer(turno).data,
            'monto_esperado': formatear_monto(monto_esperado),
        })


class CajaAbrirView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = AperturaCajaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        perfil = obtener_usuario_monesy({'request': request})
        usuario = AppUser.objects.select_for_update().get(pk=perfil.pk)

        turno_existente = TurnoCaja.objects.filter(
            usuario=usuario,
            fecha_cierre__isnull=True,
        ).exists()
        if turno_existente:
            return Response(
                {
                    'detail': (
                        'Ya existe un turno de caja abierto para este usuario.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        turno = TurnoCaja.objects.create(
            usuario=usuario,
            **serializer.validated_data,
        )
        return Response(
            TurnoCajaSerializer(turno).data,
            status=status.HTTP_201_CREATED,
        )


class CajaCerrarView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CierreCajaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        perfil = obtener_usuario_monesy({'request': request})
        usuario = AppUser.objects.select_for_update().get(pk=perfil.pk)
        turno = TurnoCaja.objects.select_for_update().filter(
            usuario=usuario,
            fecha_cierre__isnull=True,
        ).order_by('-fecha_apertura', '-id').first()

        if turno is None:
            return Response(
                {'detail': 'No hay un turno de caja abierto para cerrar.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        monto_final_sistema = (
            turno.monto_inicial + total_efectivo_turno(turno)
        )
        observacion_cierre = serializer.validated_data.get('observacion')

        if observacion_cierre:
            if turno.observacion:
                turno.observacion = (
                    f'{turno.observacion}\nCierre: {observacion_cierre}'
                )
            else:
                turno.observacion = observacion_cierre

        turno.fecha_cierre = timezone.now()
        turno.monto_final_real = serializer.validated_data[
            'monto_final_real'
        ]
        turno.monto_final_sistema = monto_final_sistema
        turno.save(update_fields=[
            'fecha_cierre',
            'monto_final_real',
            'monto_final_sistema',
            'observacion',
        ])
        turno.refresh_from_db()

        return Response(TurnoCajaSerializer(turno).data)


class ReportesResumenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hoy = timezone.localdate()
        fecha_inicio_parametro = request.query_params.get('fecha_inicio')
        fecha_fin_parametro = request.query_params.get('fecha_fin')
        fecha_inicio = (
            parse_date(fecha_inicio_parametro)
            if fecha_inicio_parametro
            else hoy.replace(day=1)
        )
        fecha_fin = (
            parse_date(fecha_fin_parametro)
            if fecha_fin_parametro
            else hoy
        )

        if fecha_inicio is None or fecha_fin is None:
            return Response(
                {
                    'detail': (
                        'Las fechas deben tener el formato AAAA-MM-DD.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if fecha_inicio > fecha_fin:
            return Response(
                {
                    'detail': (
                        'La fecha de inicio no puede ser posterior a la fecha final.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        ventas = Venta.objects.filter(
            fecha__date__range=(fecha_inicio, fecha_fin),
        )
        compras = Compra.objects.filter(
            fecha__date__range=(fecha_inicio, fecha_fin),
        )
        devoluciones = Devolucion.objects.filter(
            fecha__date__range=(fecha_inicio, fecha_fin),
        )

        total_ventas = ventas.aggregate(
            total=Coalesce(Sum('total'), Decimal('0.00')),
        )['total']
        total_compras = compras.aggregate(
            total=Coalesce(Sum('total'), Decimal('0.00')),
        )['total']
        total_devoluciones = devoluciones.aggregate(
            total=Coalesce(Sum('total_devuelto'), Decimal('0.00')),
        )['total']

        ventas_por_metodo = [
            {
                'metodo_pago': item['metodo_pago'],
                'cantidad': item['cantidad'],
                'total': formatear_monto(item['total']),
            }
            for item in ventas.values('metodo_pago').annotate(
                cantidad=Count('id'),
                total=Coalesce(Sum('total'), Decimal('0.00')),
            ).order_by('metodo_pago')
        ]
        top_productos = [
            {
                'producto_id': item['producto_id'],
                'codigo': item['producto__codigo'],
                'nombre': item['producto__nombre'],
                'cantidad': item['cantidad'],
                'total': formatear_monto(item['total']),
            }
            for item in DetalleVenta.objects.filter(
                venta__fecha__date__range=(fecha_inicio, fecha_fin),
            ).values(
                'producto_id',
                'producto__codigo',
                'producto__nombre',
            ).annotate(
                cantidad=Sum('cantidad'),
                total=Coalesce(Sum('subtotal'), Decimal('0.00')),
            ).order_by('-cantidad', '-total')[:5]
        ]
        stock_bajo = [
            {
                'id': producto.id,
                'codigo': producto.codigo,
                'nombre': producto.nombre,
                'stock_actual': producto.stock_actual,
                'stock_minimo': producto.stock_minimo,
            }
            for producto in Producto.objects.filter(
                activo=True,
                stock_actual__lte=F('stock_minimo'),
            ).order_by('stock_actual', 'nombre')
        ]

        return Response({
            'fecha_inicio': fecha_inicio.isoformat(),
            'fecha_fin': fecha_fin.isoformat(),
            'cantidad_ventas': ventas.count(),
            'total_ventas': formatear_monto(total_ventas),
            'cantidad_compras': compras.count(),
            'total_compras': formatear_monto(total_compras),
            'cantidad_devoluciones': devoluciones.count(),
            'total_devoluciones': formatear_monto(total_devoluciones),
            'ventas_netas': formatear_monto(
                total_ventas - total_devoluciones,
            ),
            'ventas_por_metodo': ventas_por_metodo,
            'top_productos': top_productos,
            'stock_bajo': stock_bajo,
        })


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


class CompraViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = (
        Compra.objects
        .select_related('proveedor', 'usuario')
        .prefetch_related('detalles__producto')
        .all()
        .order_by('-id')
    )
    serializer_class = CompraSerializer


class VentaViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = (
        Venta.objects.select_related('cliente', 'cajero', 'turno')
        .prefetch_related('detalles__producto')
        .all()
        .order_by('-id')
    )
    serializer_class = VentaSerializer


class DevolucionViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = (
        Devolucion.objects
        .select_related('venta', 'usuario')
        .prefetch_related('detalles__producto')
        .all()
        .order_by('-fecha', '-id')
    )
    serializer_class = DevolucionSerializer


class DetalleDevolucionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DetalleDevolucion.objects.select_related('devolucion', 'producto').all().order_by('id')
    serializer_class = DetalleDevolucionSerializer


class DetalleCompraViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DetalleCompra.objects.select_related('compra', 'producto',).all().order_by('id')
    serializer_class = DetalleCompraSerializer

class DetalleVentaViewSet(viewsets.ReadOnlyModelViewSet):
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


class TurnoCajaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TurnoCaja.objects.select_related('usuario').all().order_by('-fecha_apertura', '-id')
    serializer_class = TurnoCajaSerializer


class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all().order_by('id')
    serializer_class = ProveedorSerializer
