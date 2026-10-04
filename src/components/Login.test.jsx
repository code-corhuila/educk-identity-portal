import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import Login from './Login';
import * as shellModule from 'educk-front';
import * as sessionModule from '../session';

// Mock the shell module
vi.mock('educk-front', () => ({
  setSession: vi.fn(),
  loginWithApi: vi.fn()
}));

// Mock the session module
vi.mock('../session', () => ({
  getLoginValidationError: vi.fn(),
  adaptSessionFromApi: vi.fn()
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
    const mockRawData = { dummy: 'data' };
    const mockAdaptedData = { user: mockUser, accessToken: mockToken, expiresIn: 3600, tokenType: 'Bearer' };
    
    sessionModule.getLoginValidationError.mockReturnValue('');
    shellModule.loginWithApi.mockResolvedValueOnce(mockRawData);
    sessionModule.adaptSessionFromApi.mockReturnValue(mockAdaptedData);
    
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
      expect(shellModule.loginWithApi).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        expect.any(String)
      );
    });
    
    expect(shellModule.setSession).toHaveBeenCalledWith(mockToken, mockUser, 3600, 'Bearer');
    expect(window.location.href).toContain('http://localhost:3000');
  });

  test('shows error message in DOM on failed login', async () => {
    sessionModule.getLoginValidationError.mockReturnValue('');
    shellModule.loginWithApi.mockRejectedValueOnce(new Error('Auth failed'));

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('maria.lopez@email.com'), { target: { value: 'bad@email.com' } });
    fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByText('Ingresar a EduTrack'));

    await waitFor(() => {
      expect(screen.getByText('Auth failed')).toBeInTheDocument();
    });

    expect(shellModule.setSession).not.toHaveBeenCalled();
  });

  test('shows error message when gateway or redirect URL is missing', async () => {
    sessionModule.getLoginValidationError.mockReturnValue('');
    vi.stubEnv('VITE_API_GATEWAY_URL', '');
    vi.stubEnv('VITE_REDIRECT_URL', '');

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('maria.lopez@email.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Ingresar a EduTrack'));

    await waitFor(() => {
      expect(screen.getByText('System configuration error: Missing gateway or redirect URL')).toBeInTheDocument();
    });

    expect(shellModule.loginWithApi).not.toHaveBeenCalled();

    vi.stubEnv('VITE_API_GATEWAY_URL', 'http://test-gateway');
    vi.stubEnv('VITE_REDIRECT_URL', 'http://localhost:3000');
  });

  test('does not call native alert on auth error', async () => {
    sessionModule.getLoginValidationError.mockReturnValue('');
    shellModule.loginWithApi.mockRejectedValueOnce(new Error('Auth failed'));

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('maria.lopez@email.com'), { target: { value: 'bad@email.com' } });
    fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByText('Ingresar a EduTrack'));

    await waitFor(() => {
      expect(screen.getByText('Auth failed')).toBeInTheDocument();
    });

    expect(alertMock).not.toHaveBeenCalled();
    alertMock.mockRestore();
  });
});
