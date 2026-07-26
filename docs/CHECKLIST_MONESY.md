# Checklist del proyecto Monesy

## Como interpretar el checklist

- Un paso se marca como completado cuando su implementacion existe y tiene una verificacion basica.
- Las APIs de compras, ventas, caja y devoluciones creadas en los pasos 19 al 23 son la base CRUD.
- Sus flujos completos y atomicos se terminaran antes de construir cada pantalla correspondiente.
- Las pruebas se realizaran durante el desarrollo. Los pasos 44 al 49 verificaran los flujos completos.

## Fase 1. Analisis, base de datos y repositorio

- [x] 1. Definir idea del proyecto
- [x] 2. Definir nombre del sistema: Monesy
- [x] 3. Definir problema del minimarket
- [x] 4. Definir base de datos PostgreSQL
- [x] 5. Crear DER
- [x] 6. Crear base de datos Monesydb
- [x] 7. Verificar tablas, relaciones, enums y triggers
- [x] 8. Crear repositorio Git / GitHub
- [x] 9. Crear estructura del proyecto

## Fase 2. Backend y APIs base

- [x] 10. Crear backend con Django
- [x] 11. Conectar backend con PostgreSQL
- [x] 12. Crear modelos Django segun la base
- [x] 13. Crear autenticacion con JWT
- [x] 14. Crear API de usuarios y roles
- [x] 15. Crear API de categorias y unidades de medida
- [x] 16. Crear API de productos
- [x] 17. Crear API de proveedores
- [x] 18. Crear API de clientes
- [x] 19. Crear API CRUD base de compras
- [x] 20. Crear API CRUD base de ventas
- [x] 21. Crear API y servicio base de movimientos de stock
- [x] 22. Crear API CRUD base de turnos de caja
- [x] 23. Crear API CRUD base de devoluciones
- [x] 24. Crear API de historial de precios

## Fase 3. Frontend base

- [x] 25. Crear frontend con React + Vite + TypeScript
- [x] 26. Instalar Tailwind CSS
- [x] 27. Instalar shadcn/ui
- [x] 28. Instalar React Router
- [x] 29. Instalar Axios
- [x] 30. Instalar TanStack Query
- [x] 31. Crear layout principal del sistema

## Fase 4. Estabilizacion antes de las pantallas

- [x] 31.5. Alinear modelos, identidad y contratos criticos
  - [x] Corregir la clave primaria compuesta de app_user_rol
  - [x] Vincular auth_user con app_user
  - [x] Crear el perfil Monesy y asignar el rol ADMIN al usuario inicial
  - [x] Usar Django como fuente de identidad para la API de usuarios
  - [x] Proteger el stock actual y los historiales contra edicion directa
  - [x] Registrar el usuario autenticado en los cambios de precio
  - [x] Agregar pruebas de contratos criticos del backend
  - [x] Verificar Django, pruebas, lint y build
- [x] 31.6. Completar seguridad y trazabilidad de movimientos de stock
  - [x] Obtener el usuario del movimiento desde el JWT
  - [x] Impedir que el cliente envie otro usuario en el payload
  - [x] Agregar pruebas del contrato de seguridad
  - [x] Verificar check, tests y correspondencia con PostgreSQL

## Fase 5. Autenticacion e integracion inicial

- [x] 32. Crear login completo
  - [x] Permitir CORS desde el frontend local
  - [x] Configurar la URL base de Axios mediante variables de entorno
  - [x] Crear el servicio de autenticacion
  - [x] Crear el formulario de login
  - [x] Guardar los tokens JWT en sessionStorage
  - [x] Renovar automaticamente el access token
  - [x] Enviar el access token automaticamente con Axios
  - [x] Crear un endpoint para consultar el usuario autenticado y sus roles
  - [x] Proteger las rutas privadas
  - [x] Mostrar el usuario real y permitir cerrar sesion

## Fase 6. Pantallas y flujos de negocio

- [x] 33. Crear dashboard con datos reales
- [x] 34. Crear pantalla de productos
- [x] 34.5. Agregar modo claro y oscuro
- [ ] 35. Crear pantalla de proveedores
- [ ] 36. Crear pantalla de clientes
- [ ] 37. Completar flujo y pantalla de compras
  - [ ] Crear compra, detalles y entradas de stock en una transaccion atomica
  - [ ] Calcular y validar subtotales y total en el backend
  - [ ] Obtener el usuario desde el JWT
  - [ ] Construir la pantalla de compras
- [ ] 38. Completar flujo y pantalla de ventas
  - [ ] Crear venta, detalles y salidas de stock en una transaccion atomica
  - [ ] Calcular total, monto recibido y cambio en el backend
  - [ ] Obtener el cajero desde el JWT y validar el turno
  - [ ] Construir la pantalla de ventas
- [ ] 39. Crear pantalla de stock e inventario
- [ ] 40. Completar flujo y pantalla de caja
  - [ ] Implementar acciones controladas de apertura y cierre
  - [ ] Calcular el monto final del sistema y la diferencia
  - [ ] Impedir turnos abiertos duplicados
  - [ ] Construir la pantalla de caja
- [ ] 41. Completar flujo y pantalla de devoluciones
  - [ ] Validar la venta y las cantidades que pueden devolverse
  - [ ] Crear devolucion, detalles y entradas de stock en una transaccion atomica
  - [ ] Obtener el usuario desde el JWT
  - [ ] Construir la pantalla de devoluciones
- [ ] 42. Crear pantalla y endpoints de reportes
- [ ] 43. Completar la conexion frontend con backend
  - [x] Configurar CORS y cliente Axios base
  - [x] Configurar TanStack Query en la aplicacion
  - [ ] Conectar todas las pantallas con sus APIs
  - [ ] Manejar carga, errores y estados vacios
  - [ ] Verificar navegacion y diseno responsivo

## Fase 7. Roles, pruebas y correcciones

- [ ] 44. Probar flujo completo de compra
- [ ] 45. Probar flujo completo de venta
- [ ] 46. Probar actualizacion de stock
- [ ] 47. Probar devolucion
- [ ] 48. Probar apertura y cierre de caja
- [ ] 49. Implementar y probar permisos para ADMIN, CAJERO y SUPERVISOR
- [ ] 50. Corregir errores encontrados
- [ ] 51. Crear datos de prueba representativos

## Fase 8. Documentacion y entrega

- [ ] 52. Tomar capturas del sistema
- [ ] 53. Actualizar documento Word para que coincida con la implementacion
- [ ] 54. Actualizar DER, scripts SQL y explicacion de la base de datos
- [ ] 55. Agregar capturas al documento
- [ ] 56. Crear manual basico de usuario
- [ ] 57. Preparar presentacion
- [ ] 58. Ensayar defensa
- [ ] 59. Entrega final

## Stack definido

- Backend: Python, Django, Django REST Framework
- API/Auth: DRF, djangorestframework-simplejwt
- Base de datos: PostgreSQL, pgAdmin 4
- Frontend: React, Vite, TypeScript
- UI: Tailwind CSS, shadcn/ui, lucide-react
- Datos frontend: Axios, TanStack Query
- Navegacion: React Router
- Entorno: venv, Node.js, npm
- Seguridad config: .env, python-decouple, django-cors-headers
- Versionado: Git, GitHub

## Avance del paso 8

- [x] Repositorio Git local inicializado
- [x] Archivo .gitignore creado
- [x] Repositorio GitHub creado
- [x] Remoto origin configurado
- [x] Primer commit subido a GitHub
