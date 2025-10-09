import { MongoClient, type Db } from "mongodb"

const uri = process.env.MONGODB_URI || ""
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (uri) {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options)
      global._mongoClientPromise = client.connect()
    }
    clientPromise = global._mongoClientPromise
  } else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

export async function getDatabase(): Promise<Db | null> {
  if (!clientPromise) {
    console.warn("MongoDB no está configurado. Agrega MONGODB_URI a las variables de entorno.")
    return null
  }

  try {
    const client = await clientPromise
    return client.db("finanzas_app")
  } catch (error) {
    console.error("Error conectando a MongoDB:", error)
    return null
  }
}

export function isMongoDBConfigured(): boolean {
  return !!uri && uri.length > 0
}

export default clientPromise