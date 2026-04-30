# Booqi - Sistema de Gestión de Reservas de Eventos

Sistema de gestión de reservas de eventos desarrollado con arquitectura de microservicios, que permite a los usuarios explorar eventos, realizar reservas y gestionar pagos de manera eficiente.

## REPOSITORIO ORIGINAL

https://gitlab.com/booqui

## Descripción del Proyecto

Booqi es una plataforma completa para la gestión de eventos y reservas que facilita la compra de entradas para diversos tipos de eventos. El sistema está diseñado con una arquitectura de microservicios independientes que se comunican entre sí, garantizando escalabilidad, mantenibilidad y alta disponibilidad.

### Características Principales

- **Gestión de Usuarios**: Registro, autenticación y administración de perfiles de usuario
- **Catálogo de Eventos**: Exploración y búsqueda de eventos disponibles con información detallada
- **Sistema de Reservas**: Proceso completo de reserva de entradas para eventos
- **Procesamiento de Pagos**: Gestión segura de transacciones y pagos de reservas
- **Generación de Tickets**: Creación automática de tickets en formato PDF
- **Panel de Administración**: Gestión de eventos, reportes y estadísticas
- **Mis Reservas**: Visualización del historial de reservas del usuario

## Arquitectura del Sistema

El proyecto está compuesto por **4 microservicios backend** independientes, **1 frontend** web y una **capa de despliegue** con Docker:

### Microservicios Backend

#### 1. User Service (Puerto 8080)
Microservicio encargado de la gestión de usuarios y autenticación.

**Funcionalidades:**
- Registro de nuevos usuarios
- Autenticación y login
- Gestión de perfiles de usuario
- Administración de roles y permisos

#### 2. Event Service (Puerto 8081)
Microservicio para la administración del catálogo de eventos.

**Funcionalidades:**
- Creación y gestión de eventos
- Consulta de eventos disponibles
- Gestión de capacidad y disponibilidad
- Categorización de eventos

#### 3. Booking Service (Puerto 8082)
Microservicio que gestiona las reservas de los usuarios.

**Funcionalidades:**
- Creación de reservas
- Consulta de reservas por usuario
- Actualización de estado de reservas
- Validación de disponibilidad

#### 4. Payment Service (Puerto 8083)
Microservicio para el procesamiento de pagos.

**Funcionalidades:**
- Procesamiento de pagos
- Registro de transacciones
- Actualización de estado de pagos
- Integración con servicios de reservas

### Frontend

**Aplicación web moderna** desarrollada con React que proporciona una interfaz de usuario intuitiva y responsiva.

**Páginas principales:**
- **Home**: Página de inicio con eventos destacados
- **Events**: Catálogo completo de eventos
- **Event Detail**: Información detallada de cada evento
- **Cart**: Carrito de compras para gestionar reservas
- **Checkout**: Proceso de pago
- **My Bookings**: Historial de reservas del usuario
- **Login/Register**: Autenticación de usuarios
- **Admin Panel**: Panel administrativo para gestión de eventos
- **Contact**: Formulario de contacto

## Stack Tecnológico

### Backend (Microservicios)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Java** | 17 | Lenguaje de programación principal |
| **Spring Boot** | 4.0.3 | Framework para desarrollo de aplicaciones |
| **Spring Data JPA** | - | Persistencia y acceso a datos |
| **Spring Web** | - | Desarrollo de APIs RESTful |
| **Spring Validation** | - | Validación de datos |
| **MySQL** | 8.0 | Base de datos relacional |
| **Lombok** | - | Reducción de código boilerplate |
| **MapStruct** | 1.5.5 | Mapeo de objetos |
| **SpringDoc OpenAPI** | 2.3.0 | Documentación automática de APIs |
| **Maven** | - | Gestión de dependencias y build |
| **Docker** | - | Containerización de servicios |

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.2.0 | Framework de interfaz de usuario |
| **Vite** | 7.3.1 | Herramienta de build y desarrollo |
| **React Router DOM** | 7.13.1 | Enrutamiento de la aplicación |
| **Axios** | 1.13.5 | Cliente HTTP para APIs |
| **Bootstrap** | 5.3.8 | Framework CSS para diseño responsivo |
| **Bootstrap Icons** | 1.13.1 | Iconografía |
| **PDF-Lib** | 1.17.1 | Generación de tickets PDF |
| **ESLint** | 9.39.1 | Linting de código |

### Infraestructura y Deployment

| Tecnología | Propósito |
|------------|-----------|
| **Docker** | Containerización de todos los servicios |
| **Docker Compose** | Orquestación de múltiples contenedores |
| **Nginx** | Servidor web para el frontend |
| **MySQL** | Base de datos centralizada |

## Base de Datos

El sistema utiliza **MySQL 8.0** con una arquitectura de base de datos distribuida:

- **user**: Base de datos del servicio de usuarios
- **event**: Base de datos del servicio de eventos
- **booking**: Base de datos del servicio de reservas
- **payment**: Base de datos del servicio de pagos

Cada microservicio tiene su propia base de datos, siguiendo el patrón de **Database per Service** de arquitectura de microservicios.

## Comunicación entre Servicios

Los microservicios se comunican entre sí mediante **REST APIs** utilizando **RestTemplate**:

- **Booking Service** consume APIs de User Service y Event Service
- **Payment Service** consume APIs de Booking Service y Event Service

## Documentación de APIs

Cada microservicio cuenta con documentación automática de su API mediante **Swagger/OpenAPI**, accesible en:

- User Service: `http://localhost:8080/swagger-ui.html`
- Event Service: `http://localhost:8081/swagger-ui.html`
- Booking Service: `http://localhost:8082/swagger-ui.html`
- Payment Service: `http://localhost:8083/swagger-ui.html`

## Características Técnicas

### Patrones de Diseño
- **Arquitectura de Microservicios**
- **Repository Pattern**
- **DTO (Data Transfer Object) Pattern**
- **Mapper Pattern** (con MapStruct)
- **Dependency Injection**

### Buenas Prácticas
- **Separación de capas** (Controller, Service, Repository)
- **Validación de datos** con Bean Validation
- **Mapeo automático** de entidades con MapStruct
- **Configuración CORS** para comunicación frontend-backend
- **Healthchecks** en contenedores Docker
- **Variables de entorno** para configuración
- **Documentación automática** de APIs

## Estructura del Proyecto

```
booqi/
├── user/               # Microservicio de usuarios
├── event/              # Microservicio de eventos
├── booking/            # Microservicio de reservas
├── payment/            # Microservicio de pagos
├── front/              # Aplicación frontend
└── deployment-booqi/   # Configuración de despliegue
    ├── docker-compose.yml
    └── 001_init_database.sql
```

## Despliegue

El proyecto está completamente dockerizado y puede desplegarse fácilmente usando Docker Compose, que orquesta:

- 1 contenedor de MySQL
- 4 contenedores para los microservicios backend
- 1 contenedor para el frontend con Nginx
- Red Docker dedicada para comunicación entre servicios
- Volúmenes persistentes para la base de datos

## Desarrolladores

- **Renzo Iván Ramos de los Ríos**
- **Melanie Gabriela Cárdenas Hidalgo**

---

**Versión**: 0.0.1-SNAPSHOT  
**Licencia**: Proyecto académico
