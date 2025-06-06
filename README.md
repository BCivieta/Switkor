# 🏋️‍♀️ Switkor

**Switkor** es una plataforma para la planificación automática de entrenamiento físico dirigida a deportistas amateurs. Genera planes semanales personalizados en función del nivel, objetivos, disponibilidad y sexo del usuario. Esta app combina un potente backend construido con NestJS y un frontend moderno con Next.js y TailwindCSS.

---

## 📁 Estructura del Proyecto

```
Switkor/
├── switkor-frontend/    # Frontend en Next.js 14
└── switkor-backend/     # Backend con NestJS
```

---

## 🚀 Tecnologías principales

- **Frontend:** Next.js 14, TailwindCSS, HeroIcons, TypeScript, React Hook Form
- **Backend:** NestJS, TypeORM, JWT Auth
- **Base de datos:** SQLite para desarrollo
- **DevOps:** Separación de entornos, .env, arquitectura modular

---

## 🧠 Funcionalidades principales

- Registro e inicio de sesión con autenticación JWT
- Creación de perfil personalizado (nivel, objetivo, disponibilidad, sexo.)
- Generación automática de planes de entrenamiento
- Visualización de entrenamientos semanales
- Panel de usuario
- Diseño responsive y accesible

---

## 🧱 Instalación y ejecución

### 1. Clona el repositorio
```bash
git clone https://github.com/BCivieta/Switkor.git
cd Switkor
```

### 2. Instalación de dependencias
#### Backend
```bash
cd switkor-backend
npm install
```

#### Frontend
```bash
cd ../switkor-frontend
npm install
```

### 3. Ejecutar en desarrollo
#### Backend
```bash
npm run start:dev
```

#### Frontend
```bash
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:3001](http://localhost:3001)

> Asegúrate de que las variables `NEXT_PUBLIC_API_URL` y `.env` están correctamente configuradas.

---

## 🌐 Despliegue

### 🔷 Frontend: [Vercel](https://vercel.com)

### 🔶 Backend: Opcional en Railway, Render o servidor propio (Dockerizable)

Para desplegar el backend, sigue la [documentación oficial de NestJS](https://docs.nestjs.com/deployment).

---

## 🖥️ Screenshots

![Landing](./switkor-frontend/public/Landing.png)

---

## 🧩 Recursos útiles

- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [TypeORM Docs](https://typeorm.io/)

---

## 🪪 Licencia

MIT License · Proyecto académico desarrollado por Blanca Civieta

---

## ✍️ Créditos

