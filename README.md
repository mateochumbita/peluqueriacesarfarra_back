# 💇‍♂️ Backend - Peluquería César Farra

Este proyecto corresponde al backend del sistema de gestión para la **Peluquería César Farra**. Permite llevar a cabo el control de turnos, clientes, peluqueros, servicios, y autenticación de usuarios con distintos roles. Por un lado el rol de administrador, llevado a cabo por el dueño y peluquero César Farra y por otro lado el rol de Clientes.

## 🧾 Descripción

El sistema está desarrollado con Node.js, Express y Sequelize ORM para interactuar con una base de datos PostgreSQL a través de Supabase. Ofrece una API RESTful segura mediante autenticación JWT, y está preparado para integrarse con un frontend o cliente móvil.




## 🚀 Funcionalidades principales

- Registro de Clientes e inicio de sesión con JWT.
- Gestión de clientes, servicios, turnos e ingresos.
- Programación, reprogramación y cancelación de turnos.
- Control de acceso basado en roles.

---

### ✨Link del repositorio Frontend del proyecto

Si usted está por iniciar la instalación y ejecución del proyecto pero desea tener una experciencia completa, es altamente recomendable primero realizar la instalación del Backend y luego dirigirse al repositorio del Frontend para realizar el mismo proceso
### Link del repositorio Frontend
<https://github.com/mateochumbita/peluqueriacesarfarra_front>


## ⚙️ Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/mateochumbita/peluqueriacesarfarra_back.git
cd peluqueriacesarfarra_back
```

### 2. Instalar las dependencias
```bash
npm install

```

### 🔧 Configuración del entorno
 Crear archivo .env, coopiar y pegar las siguientes variables
```env
DATABASE_URL = postgresql://postgres.jliftkhfaoymqgaiaxac:Nicolas_Mateo_Chumbita@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
DATABASE_USER = postgres.jliftkhfaoymqgaiaxac
JWT_SECRET=tu_secreto_para_jwt
SUPABASE_URL = https://jliftkhfaoymqgaiaxac.supabase.co
JWT_SECRET=tu_clave_secreta
SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsaWZ0a2hmYW95bXFnYWlheGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNzU5MjgsImV4cCI6MjA2MDg1MTkyOH0.qtAa5OWn8X4vX1hv8a_WPOCXIRLHMdBglBzZTIpudbc
RESEND_API_KEY = re_Bq1me9Hu_Jfdxaj23LVqrDV3jbRSgYT9d
EMAIL_USER=mchumbita782@alumnos.iua.edu.ar
EMAIL_PASS=dtlj eirw hakz fpyk

```

### 3. Ejecutar el backend

```bash
npm run dev

```
### 📘 Swagger: Documentación de las rutas de la aplicación
1. Ingresar a su navegador de confianza Chrome, Firefox, Edge, etc.
2. ingresar en la barra de búsqueda: <localhost:3001/api-docs>

## Link del despliegue de Swagger
Otra opción es accediendo al link del despliegue del Swagger en Netlify:
<https://glittering-cucurucho-f990e1.netlify.app/>


### 🧪 Ejecutar pruebas 
El proyecto incluye pruebas automatizadas, tanto unitarias como de integración.
Para ejecutarlas todas al mismo tiempo puede utilizar el siguiente comando 

```bash
npm run test

```


Para ejecutar las pruebas unitarias:
```bash
npm run test:unit

```
Para ejecutar las pruebas de integración
```bash
npm run test:integration

```





