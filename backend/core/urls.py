from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AppUserRolViewSet, AppUserViewSet, RolViewSet

router = DefaultRouter()
router.register(r'roles', RolViewSet, basename='roles')
router.register(r'usuarios', AppUserViewSet, basename='usuarios')
router.register(r'usuarios-roles', AppUserRolViewSet, basename='usuarios-roles')

urlpatterns = [
    path('', include(router.urls)),
]