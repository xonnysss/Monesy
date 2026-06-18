from rest_framework import status, viewsets
from rest_framework.response import Response

from .models import AppUser, AppUserRol, Rol
from .serializers import AppUserRolSerializer, AppUserSerializer, RolSerializer


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


class AppUserViewSet(viewsets.ModelViewSet):
    queryset = AppUser.objects.all().order_by('id')
    serializer_class = AppUserSerializer


class AppUserRolViewSet(viewsets.ModelViewSet):
    queryset = AppUserRol.objects.select_related('user', 'rol').all()
    serializer_class = AppUserRolSerializer
