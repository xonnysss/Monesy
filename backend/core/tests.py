from unittest.mock import patch
from types import SimpleNamespace

from django.test import SimpleTestCase
from rest_framework import mixins, viewsets
from rest_framework.exceptions import ValidationError

from .models import AppUserRol
from .serializers import (
    MovimientoStockSerializer,
    ProductoSerializer,
    obtener_usuario_monesy,
)
from .views import HistorialPrecioViewSet, MovimientoStockViewSet


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