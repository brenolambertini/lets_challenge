import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createClient, updateClient, deleteClient, getClient, listClients } from '../index';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// Mock DynamoDB operations to avoid actual AWS calls during tests
jest.mock('@aws-sdk/client-dynamodb');

// Describe the test suite for handlers
describe('CRUD Handlers', () => {
  const mockSend = jest.fn();

  // Mock DynamoDBClient's send method
  beforeAll(() => {
    DynamoDBClient.prototype.send = mockSend;
  });

  // Test the 'createClient' handler
  it('should create a client successfully', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        id: '1',
        fullName: 'Breno Lambertini',
        birthDate: '2000-03-10',
        isActive: true,
        addresses: ['rua teste'],
        contacts: [{ email: 'john.doe@example.com', phone: '1234567890', isPrimary: true }],
      }),
    } as any;

    mockSend.mockResolvedValueOnce({});

    const response: APIGatewayProxyResult = await createClient(event);

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body).message).toBe('Client created successfully!');
  });

  // Test the error scenario for 'createClient' handler
  it('should handle error when creating client', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        id: '2',
        fullName: 'João Lambertini',
        birthDate: '2000-03-10',
        isActive: true,
        addresses: ['rua oeste'],
        contacts: [{ email: 'john.doe@example.com', phone: '1234567890', isPrimary: true }],
      }),
    } as any;

    // Simulate an error response from DynamoDB
    mockSend.mockRejectedValueOnce(new Error('DynamoDB Error'));

    const response: APIGatewayProxyResult = await createClient(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).message).toBe('Failed to create client');
  });

  // Test the 'getClient' handler when client ID is missing
  it('should return 400 when missing client ID in getClient', async () => {
    const event: APIGatewayProxyEvent = {} as any;
    const response = await getClient(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe('Client ID is required');
  });

  // Test the 'getClient' handler with a valid client ID
  it('should get a client successfully', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: { id: '1' },
    } as any;

    mockSend.mockResolvedValueOnce({
      Item: {
        id: { S: '1' },
        fullName: { S: 'Breno Lambertini' },
        birthDate: { S: '2000-03-10' },
        isActive: { BOOL: true },
        addresses: { SS: ['rua teste'] },
        contacts: { S: JSON.stringify([{ email: 'john.doe@example.com', phone: '1234567890', isPrimary: true }]) },
      },
    });

    const response: APIGatewayProxyResult = await getClient(event);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.id).toBe('1');
    expect(body.fullName).toBe('Breno Lambertini');
  });

  it('should return 404 when client is not found', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: { id: '123' },
    } as any;

    mockSend.mockResolvedValueOnce({ Item: undefined });

    const response: APIGatewayProxyResult = await getClient(event);

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body).message).toBe('Client not found');
  });

  it('should handle error when fetching client', async () => {
    const event: APIGatewayProxyEvent = { pathParameters: { id: '1' } } as any;
  
    mockSend.mockRejectedValueOnce(new Error('DynamoDB Error'));
  
    const response = await getClient(event);
  
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).message).toBe('Failed to get client');
  });

  // Test the 'updateClient' handler
  it('should update a client successfully', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: { id: '1' },
      body: JSON.stringify({
        fullName: 'Breno Lambertini Updated',
        birthDate: '2000-03-11',
        isActive: true,
        addresses: ['new rua teste'],
        contacts: [{ email: 'john.doe.updated@example.com', phone: '9876543210', isPrimary: true }],
      }),
    } as any;

    mockSend.mockResolvedValueOnce({});

    const response: APIGatewayProxyResult = await updateClient(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).message).toBe('Client updated successfully!');
  });

  // Test the 'updateClient' handler when missing client ID
  it('should return 400 when missing client ID in updateClient', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        fullName: 'Breno Lambertini Updated',
        birthDate: '2000-03-11',
        isActive: true,
        addresses: ['new rua teste'],
        contacts: [{ email: 'john.doe.updated@example.com', phone: '9876543210', isPrimary: true }],
      }),
    } as any;

    const response: APIGatewayProxyResult = await updateClient(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe('Client ID is required');
  });

    // Test the error scenario for 'updateClient' handler
    it('should handle error when updating client', async () => {
      const event: APIGatewayProxyEvent = {
        pathParameters: { id: '123' },
        body: JSON.stringify({
          fullName: 'Breno Lambertini Updated',
          birthDate: '2000-03-11',
          isActive: true,
          addresses: ['new rua teste'],
          contacts: [{ email: 'john.doe.updated@example.com', phone: '9876543210', isPrimary: true }]
        })
      } as any;
  
      mockSend.mockRejectedValueOnce(new Error('DynamoDB Error'));
  
      const response: APIGatewayProxyResult = await updateClient(event);
  
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body).message).toBe('Failed to update client');
      expect(JSON.parse(response.body).error).toBe('DynamoDB Error');
    });

  // Test the 'deleteClient' handler
  it('should delete a client successfully', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: { id: '1' },
    } as any;

    mockSend.mockResolvedValueOnce({});

    const response: APIGatewayProxyResult = await deleteClient(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).message).toBe('Client deleted successfully!');
  });

  // Test the 'deleteClient' handler when missing client ID
  it('should return 400 when missing client ID in deleteClient', async () => {
    const event: APIGatewayProxyEvent = {} as any;
    const response: APIGatewayProxyResult = await deleteClient(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe('Client ID is required');
  });

  it('should handle error when deleting client', async () => {
    const event: APIGatewayProxyEvent = { pathParameters: { id: '1' } } as any;
  
    mockSend.mockRejectedValueOnce(new Error('DynamoDB Error'));
  
    const response = await deleteClient(event);
  
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).message).toBe('Failed to delete client');
  });

  // Test the 'listClients' handler to fetch all clients
  it('should list all clients successfully', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [
        {
          id: { S: '1' },
          fullName: { S: 'Breno Lambertini' },
          birthDate: { S: '2000-03-10' },
          isActive: { BOOL: true },
          addresses: { SS: ['rua teste'] },
          contacts: { S: JSON.stringify([{ email: 'john.doe@example.com', phone: '1234567890', isPrimary: true }]) },
        },
      ],
    });

    const response: APIGatewayProxyResult = await listClients();
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0].id).toBe('1');
  });

  it('should handle error when listing all client', async () => {
    mockSend.mockRejectedValueOnce(new Error('DynamoDB Error'));
  
    const response = await listClients();
  
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).message).toBe('Failed to list clients');
  });
});
