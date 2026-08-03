from django.core.exceptions import ValidationError
from django.db import transaction

from .models import MovimientoStock, Producto

ENTRADAS_STOCK = {
    MovimientoStock.COMPRA,
    MovimientoStock.DEVOLUCION,
}

SALIDAS_STOCK = {
    MovimientoStock.VENTA,
    MovimientoStock.ANULACION,
}


@transaction.atomic
def registrar_movimiento_stock(
    *,
    producto,
    usuario,
    tipo,
    cantidad=None,
    stock_nuevo=None,
    referencia_tipo=None,
    referencia_id=None,
    observacion=None,
):
    producto_actual = Producto.objects.select_for_update().get(pk=producto.pk)
    stock_anterior = producto_actual.stock_actual

    if tipo in ENTRADAS_STOCK:
        if cantidad is None or cantidad <= 0:
            raise ValidationError('La cantidad debe ser mayor a cero.')
        
        stock_calculado = stock_anterior + cantidad

    elif tipo in SALIDAS_STOCK:
        if cantidad is None or cantidad <= 0:
            raise ValidationError('La cantidad debe ser mayor a cero.')

        if stock_anterior < cantidad:
            raise ValidationError('No hay suficiente stock para registrar la salida.')
        
        stock_calculado = stock_anterior - cantidad


    elif tipo == MovimientoStock.AJUSTE_MANUAL:
        if stock_nuevo is None:
            raise ValidationError('Debe indicar el stock nuevo para un ajuste manual')

        if stock_nuevo < 0:
            raise ValidationError('El stock nuevo no puede ser negativo.')

        if stock_nuevo == stock_anterior:
            raise ValidationError('El ajuste manual debe modificar el stock')

        stock_calculado = stock_nuevo
        cantidad = abs(stock_calculado - stock_anterior)

    else:
        raise ValidationError('Tipo de movimiento de stock no valido.')

    producto_actual.stock_actual = stock_calculado
    producto_actual.save(update_fields=['stock_actual'])

    return MovimientoStock.objects.create(
        producto=producto_actual,
        usuario=usuario,
        tipo=tipo,
        cantidad=cantidad,
        stock_anterior=stock_anterior,
        stock_nuevo=stock_calculado,
        referencia_tipo=referencia_tipo,
        referencia_id=referencia_id,
        observacion=observacion,
    )
