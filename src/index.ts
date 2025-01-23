import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';

// DynamoDB table name (local)
const TABLE_NAME = 'Clients';

const dynamoDbClient = new DynamoDBClient({ 
  region: 'us-east-1',
  endpoint: "http://localhost:8000"
});

// Client model
class Client {
  constructor(
    public id: string,
    public fullName: string,
    public birthDate: string,
    public isActive: boolean,
    public addresses: string[],
    public contacts: { email: string; phone: string; isPrimary: boolean }[]
  ) {}

  static fromEvent(event: APIGatewayProxyEvent): Client {
    const body = JSON.parse(event.body || '{}');
    return new Client(
      body.id,
      body.fullName,
      body.birthDate,
      body.isActive,
      body.addresses,
      body.contacts
    );
  }

  toItem(): Record<string, any> {
    return {
      id: { S: this.id },
      fullName: { S: this.fullName },
      birthDate: { S: this.birthDate },
      isActive: { BOOL: this.isActive },
      addresses: { SS: this.addresses },
      contacts: { S: JSON.stringify(this.contacts) }
    };
  }

  static fromItem(item: Record<string, any>): Client {
    return new Client(
      item.id.S,
      item.fullName.S,
      item.birthDate.S,
      item.isActive.BOOL,
      item.addresses.SS,
      JSON.parse(item.contacts.S)
    );
  }
}

// Handlers
export const createClient = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const client = Client.fromEvent(event);
    const command = new PutItemCommand({ TableName: TABLE_NAME, Item: client.toItem() });
    await dynamoDbClient.send(command);
    return { statusCode: 201, body: JSON.stringify({ message: 'Client created successfully!' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Failed to create client', error: error.message }) };
  }
};

export const getClient = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return { statusCode: 400, body: JSON.stringify({ message: 'Client ID is required' }) };

    const command = new GetItemCommand({ TableName: TABLE_NAME, Key: { id: { S: id } } });
    const response = await dynamoDbClient.send(command);

    if (!response.Item) return { statusCode: 404, body: JSON.stringify({ message: 'Client not found' }) };

    const client = Client.fromItem(response.Item);
    return { statusCode: 200, body: JSON.stringify(client) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Failed to get client', error: error.message }) };
  }
};

export const updateClient = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return { statusCode: 400, body: JSON.stringify({ message: 'Client ID is required' }) };

    const client = Client.fromEvent(event);
    const command = new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: { id: { S: id } },
      UpdateExpression: 'SET fullName = :f, birthDate = :b, isActive = :a, addresses = :ad, contacts = :c',
      ExpressionAttributeValues: {
        ':f': { S: client.fullName },
        ':b': { S: client.birthDate },
        ':a': { BOOL: client.isActive },
        ':ad': { SS: client.addresses },
        ':c': { S: JSON.stringify(client.contacts) }
      }
    });
    await dynamoDbClient.send(command);
    return { statusCode: 200, body: JSON.stringify({ message: 'Client updated successfully!' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Failed to update client', error: error.message }) };
  }
};

export const deleteClient = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return { statusCode: 400, body: JSON.stringify({ message: 'Client ID is required' }) };

    const command = new DeleteItemCommand({ TableName: TABLE_NAME, Key: { id: { S: id } } });
    await dynamoDbClient.send(command);
    return { statusCode: 200, body: JSON.stringify({ message: 'Client deleted successfully!' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Failed to delete client', error: error.message }) };
  }
};

export const listClients = async (): Promise<APIGatewayProxyResult> => {
  try {
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const response = await dynamoDbClient.send(command);
    const clients = response.Items?.map(Client.fromItem) || [];
    return { statusCode: 200, body: JSON.stringify(clients) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Failed to list clients', error: error.message }) };
  }
};
