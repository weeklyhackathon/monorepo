import fetchMock from 'jest-fetch-mock';
import { GET, POST, PUT, DELETE } from '../http';

fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('HTTP Client Tests', () => {
  it('GET: should append query parameters and call fetch', async () => {
    // Mock fetch response
    fetchMock.mockResponseOnce(JSON.stringify({
      success: true
    }));

    // Call the function
    const result = await GET<{ success: boolean }>({
      url: 'https://api.example.com/resource',
      query: {
        search: 'test',
        page: 1
      }
    });

    // Assertions
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/resource?search=test&page=1',
      {
        method: 'GET',
        headers: undefined
      }
    );
    expect(result).toEqual({
      success: true
    });
  });

  it('POST: should send JSON body with correct headers', async () => {
    // Mock fetch response
    fetchMock.mockResponseOnce(JSON.stringify({
      success: true
    }));

    // Call the function
    const result = await POST<{ success: boolean }>({
      url: 'https://api.example.com/resource',
      body: {
        name: 'John'
      }
    });

    // Assertions
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/resource',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'John'
        })
      }
    );
    expect(result).toEqual({
      success: true
    });
  });

  it('PUT: should send raw body when skipStringify is true', async () => {
    // Mock fetch response
    fetchMock.mockResponseOnce(JSON.stringify({
      updated: true
    }));

    // Call the function
    const result = await PUT<{ updated: boolean }>({
      url: 'https://api.example.com/resource',
      body: 'raw data',
      skipStringify: true
    });

    // Assertions
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/resource',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'raw data'
      }
    );
    expect(result).toEqual({
      updated: true
    });
  });

  it('DELETE: should send JSON body with correct method', async () => {
    // Mock fetch response
    fetchMock.mockResponseOnce(JSON.stringify({
      deleted: true
    }));

    // Call the function
    const result = await DELETE<{ deleted: boolean }>({
      url: 'https://api.example.com/resource',
      body: {
        id: 123
      }
    });

    // Assertions
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/resource',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: 123
        })
      }
    );
    expect(result).toEqual({
      deleted: true
    });
  });
});
