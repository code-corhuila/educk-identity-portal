import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import Login from './Login';
import * as sessionModule from 'educk-front';

// Mock the session module
vi.mock('educk-front', () => ({
  loginWithApi: vi.fn(),
  setSession: vi.fn()
}));

describe('Login Component', () => {
  const originalLocation = window.location;
  
  beforeAll(() => {
    delete window.location;
    window.location = { href: '' };
    vi.stubEnv('VITE_API_GATEWAY_URL', 'http://test-gateway');
    vi.stubEnv('VITE_REDIRECT_URL', 'http://localhost:3000');
  });
  
  afterAll(() => {
    window.location = originalLocation;
    vi.unstubAllEnvs();
  });
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('calls login endpoint and sets session on successful submit', async () => {
    // Setup successful mock response
    const mockUser = { name: 'Test User', email: 'test@example.com' };
    const mockToken = 'real_token_123';
    sessionModule.loginWithApi.mockResolvedValueOnce({ user: mockUser, token: mockToken });
    
    render(<Login />);
    
    // Fill out form
    fireEvent.change(screen.getByPlaceholderText('maria.lopez@email.com'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), {
      target: { value: 'password123' }
    });
    
    // Submit
    fireEvent.click(screen.getByText('Ingresar a EduTrack'));
    
    // Assertions
    await waitFor(() => {
      expect(sessionModule.loginWithApi).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        expect.any(String)
      );
    });
    
    expect(sessionModule.setSession).toHaveBeenCalledWith(mockUser, mockToken);
    expect(window.location.href).toContain('http://localhost:3000');
  });

  test('shows alert on failed login', async () => {
    // Setup failed mock response
    sessionModule.loginWithApi.mockRejectedValueOnce(new Error('Auth failed'));
    
    // Mock window.alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<Login />);
    
    // Submit form
    fireEvent.change(screen.getByPlaceholderText('maria.lopez@email.com'), { target: { value: 'bad@email.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByText('Ingresar a EduTrack'));
    
    // Wait for the alert
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Authentication failed: Auth failed');
    });
    
    expect(sessionModule.setSession).not.toHaveBeenCalled();
    alertMock.mockRestore();
  });
});
