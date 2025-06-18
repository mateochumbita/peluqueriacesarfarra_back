# 💇‍♂️ Backend - Peluquería César Farra

Este proyecto corresponde al backend del sistema de gestión para la **Peluquería César Farra**. Permite llevar a cabo el control de turnos, clientes, peluqueros, servicios, y autenticación de usuarios con distintos roles. Por un lado el rol de administrador, llevado a cabo por el dueño y peluquero César Farra y por otro lado el rol de Clientes.

## 🧾 Descripción

El sistema está desarrollado con Node.js, Express y Sequelize ORM para interactuar con una base de datos PostgreSQL a través de Supabase. Ofrece una API RESTful segura mediante autenticación JWT, y está preparado para integrarse con un frontend o cliente móvil.


### Link del Deploy 



```env
Backend: https://peluqueriacesarfarra-back.vercel.app/

Frontend:https://peluqueriacesarfarra-front.vercel.app/


```


## 🚀 Funcionalidades principales

- Registro de Clientes e inicio de sesión con JWT.
- Gestión de clientes, servicios, turnos e ingresos.
- Programación, reprogramación y cancelación de turnos.
- Control de acceso basado en roles.

---

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
DATABASE_USER = postgres.jliftkhfaoymqgaiaxacJWT_SECRET=tu_secreto_para_jwt
SUPABASE_URL = https://jliftkhfaoymqgaiaxac.supabase.co
JWT_SECRET=tu_clave_secreta
SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsaWZ0a2hmYW95bXFnYWlheGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNzU5MjgsImV4cCI6MjA2MDg1MTkyOH0.qtAa5OWn8X4vX1hv8a_WPOCXIRLHMdBglBzZTIpudbc
RESEND_API_KEY = re_Bq1me9Hu_Jfdxaj23LVqrDV3jbRSgYT9d

```

### 3. Ejecutar el backend

```bash
npm run dev

```


### 🧪 Ejecutar pruebas (opcional)
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



