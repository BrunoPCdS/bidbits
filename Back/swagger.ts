import swaggerAutogen from "swagger-autogen"

const doc = {
    openapi: "3.0.0",
    info: {
        title: "BidBits API",
        description: "Documentação da API do sistema de leilões BidBits",
        version: "1.0.0",
    },
    servers: [{ url: "http://localhost:3000" }],
}

const outputFile = "./swagger-output.json"
const routes = ["./src/server.ts"]

swaggerAutogen({ openapi: "3.0.0" })(outputFile, routes, doc)