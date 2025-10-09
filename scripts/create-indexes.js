// Script para crear índices en MongoDB para mejorar el rendimiento

import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI

if (!uri) {
  console.error("MONGODB_URI no está definida")
  process.exit(1)
}

const client = new MongoClient(uri)

async function createIndexes() {
  try {
    await client.connect()
    console.log("Conectado a MongoDB")

    const db = client.db("finanzas_app")

    // Índices para la colección de usuarios
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    console.log("Índice creado: users.email")

    // Índices para la colección de transacciones
    await db.collection("transactions").createIndex({ userId: 1, date: -1 })
    await db.collection("transactions").createIndex({ userId: 1, type: 1 })
    await db.collection("transactions").createIndex({ userId: 1, category: 1 })
    console.log("Índices creados: transactions")

    // Índices para la colección de metas
    await db.collection("goals").createIndex({ userId: 1, createdAt: -1 })
    await db.collection("goals").createIndex({ userId: 1, completed: 1 })
    console.log("Índices creados: goals")

    console.log("Todos los índices creados exitosamente")
  } catch (error) {
    console.error("Error creando índices:", error)
  } finally {
    await client.close()
  }
}

createIndexes()
