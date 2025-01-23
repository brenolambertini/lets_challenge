# Projeto de API de Clientes

Este projeto é uma API para gerenciar informações de clientes, construída com TypeScript, Node.js 20, AWS Lambda, AWS SDK, API Gateway e DynamoDB.

## Tecnologias Utilizadas

- **TypeScript**
- **Node.js 20**
- **AWS Lambda**
- **AWS SDK**
- **API Gateway**
- **DynamoDB**

## Estrutura do Projeto

- `index.ts`: Arquivo principal que define o modelo do cliente e contém os manipuladores das funções Lambda.
- `index.spec.ts`: Arquivo de cobertura de testes.

## Funcionalidades

A API possui as seguintes funcionalidades:

- **Criar Cliente**
- **Obter Cliente por ID**
- **Atualizar Cliente**
- **Excluir Cliente**
- **Listar Todos os Clientes**

## Como Executar o Projeto Localmente

1. Certifique-se de ter o Node.js 20 e o DynamoDB Local instalados em sua máquina.
2. Clone este repositório.
3. Instale as dependências usando `npm install`.
4. Inicie o DynamoDB Local usando `java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb`.

## Exemplo de Requisição

### Criar Cliente

```http
POST /clients
Content-Type: application/json

{
  "id": "1",
  "fullName": "John Doe",
  "birthDate": "1990-01-01",
  "isActive": true,
  "addresses": ["123 Main St", "456 Elm St"],
  "contacts": [
    {
      "email": "john.doe@example.com",
      "phone": "123-456-7890",
      "isPrimary": true
    }
  ]
}
