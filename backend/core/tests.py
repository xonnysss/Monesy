from unittest.mock import patch
from types import SimpleNamespace

from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework import mixins, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from .models import AppUserRol
from .serializers import (
    AperturaCajaSerializer,
    CierreCajaSerializer,
    DevolucionSerializer,
    MovimientoStockSerializer,
    ProductoSerializer,
    TurnoCajaSerializer,
    obtener_usuario_monesy,
)
from .views import (
    CajaAbrirView,
    CajaCerrarView,
    CajaEstadoView,
    DevolucionViewSet,
    HistorialPrecioViewSet,
    InventarioResumenView,
    MovimientoStockViewSet,
    ReportesResumenView,
    TurnoCajaViewSet,
)


class ContratosBackendTests(SimpleTestCase):
    def test_app_user_rol_usa_clave_compuesta(self):
        self.assertEqual(
            AppUserRol._meta.pk.field_names,
            ('user_id', 'rol_id'),
        )

    def test_stock_actual_es_solo_lectura(self):
        serializer = ProductoSerializer()

        self.assertTrue(
            serializer.fields['stock_actual'].read_only
        )

    def test_usuario_movimiento_stock_es_solo_lectura(self):
        serializer = MovimientoStockSerializer()

        self.assertTrue(
            serializer.fields['usuario'].read_only
        )

    @patch('core.serializers.registrar_movimiento_stock')
    def test_movimiento_stock_usa_usuario_autenticado(self, servicio_stock):
        perfil = object()
        usuario = SimpleNamespace(
            is_authenticated=True,
            perfil_monesy=perfil,
        )
        request = SimpleNamespace(user=usuario)
        serializer = MovimientoStockSerializer(
            context={'request': request}
        )
        datos_movimiento = {
            'producto': object(),
            'tipo': 'COMPRA',
            'cantidad': 10,
        }

        serializer.create(datos_movimiento)

        servicio_stock.assert_called_once_with(
            usuario=perfil,
            **datos_movimiento,
        )

    def test_usuario_cambio_precio_no_esta_en_payload(self):
        serializer = ProductoSerializer()

        self.assertNotIn(
            'usuario_cambio_precio',
            serializer.fields,
        )

    def test_obtiene_perfil_desde_usuario_autenticado(self):
        perfil = object()
        usuario = SimpleNamespace(
            is_authenticated=True,
            perfil_monesy=perfil,
        )
        request = SimpleNamespace(user=usuario)

        resultado = obtener_usuario_monesy({'request': request})

        self.assertIs(resultado, perfil)

    def test_rechaza_cambio_sin_peticion_autenticada(self):
        with self.assertRaises(ValidationError):
            obtener_usuario_monesy({})

    def test_historial_precio_es_solo_lectura(self):
        self.assertTrue(
            issubclass(
                HistorialPrecioViewSet,
                viewsets.ReadOnlyModelViewSet,
            )
        )

    def test_movimiento_stock_no_permite_editar_ni_eliminar(self):
        self.assertTrue(
            issubclass(
                MovimientoStockViewSet,
                mixins.CreateModelMixin,
            )
        )
        self.assertFalse(
            issubclass(
                MovimientoStockViewSet,
                mixins.UpdateModelMixin,
            )
        )
        self.assertFalse(
            issubclass(
                MovimientoStockViewSet,
                mixins.DestroyModelMixin,
            )
        )

    def test_turnos_de_caja_son_solo_lectura_fuera_de_acciones(self):
        self.assertTrue(
            issubclass(
                TurnoCajaViewSet,
                viewsets.ReadOnlyModelViewSet,
            )
        )
        serializer = TurnoCajaSerializer()
        self.assertTrue(serializer.fields['usuario'].read_only)
        self.assertTrue(serializer.fields['monto_inicial'].read_only)

    def test_devoluciones_no_permiten_edicion_ni_eliminacion(self):
        self.assertTrue(
            issubclass(
                DevolucionViewSet,
                mixins.CreateModelMixin,
            )
        )
        self.assertFalse(
            issubclass(
                DevolucionViewSet,
                mixins.UpdateModelMixin,
            )
        )
        self.assertFalse(
            issubclass(
                DevolucionViewSet,
                mixins.DestroyModelMixin,
            )
        )

    def test_devolucion_no_recibe_usuario_ni_total(self):
        serializer = DevolucionSerializer()
        self.assertTrue(serializer.fields['usuario'].read_only)
        self.assertTrue(serializer.fields['total_devuelto'].read_only)

    def test_devolucion_recibe_detalles_solo_al_crearla(self):
        serializer = DevolucionSerializer()

        self.assertTrue(serializer.fields['detalles'].write_only)
        self.assertTrue(
            serializer.fields['detalles_registrados'].read_only
        )

    def test_montos_de_apertura_y_cierre_no_aceptan_negativos(self):
        apertura = AperturaCajaSerializer(
            data={'monto_inicial': '-0.01'},
        )
        cierre = CierreCajaSerializer(
            data={'monto_final_real': '-0.01'},
        )

        self.assertFalse(apertura.is_valid())
        self.assertFalse(cierre.is_valid())

    def test_rutas_de_los_nuevos_flujos_se_resuelven(self):
        self.assertEqual(
            reverse('inventario-resumen'),
            '/api/inventario/resumen/',
        )
        self.assertEqual(reverse('caja-estado'), '/api/caja/estado/')
        self.assertEqual(reverse('caja-abrir'), '/api/caja/abrir/')
        self.assertEqual(reverse('caja-cerrar'), '/api/caja/cerrar/')
        self.assertEqual(
            reverse('reportes-resumen'),
            '/api/reportes/resumen/',
        )

    def test_nuevos_endpoints_usan_vistas_protegidas(self):
        for view in (
            InventarioResumenView,
            CajaEstadoView,
            CajaAbrirView,
            CajaCerrarView,
            ReportesResumenView,
        ):
            self.assertEqual(view.permission_classes, [IsAuthenticated])
