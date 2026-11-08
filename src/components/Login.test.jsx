import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import Login from './Login';
import * as shellModule from 'educk-front';
import * as sessionModule from '../session';

// Mock the shell module
vi.mock('educk-front', () => ({
  loginWithApi: vi.fn()
}));

// Mock the session module
vi.mock('../session', () => ({
  getLoginValidationError: vi.fn(),
  adaptSessionFromApi: vi.fn()
}));

describe('Login Component', () => {
  const originalLocation = window.location;
  const originalParentDescriptor = Object.getOwnPropertyDescriptor(window, 'parent');
  let replaceMock;

  beforeAll(() => {
    delete window.location;
    replaceMock = vi.fn();
    window.location = { href: '', replace: replaceMock };
    vi.stubEnv('VITE_API_GATEWAY_URL', 'http://test-gateway');
    vi.stubEnv('VITE_REDIRECT_URL', 'http://localhost:3000');
  });

  afterAll(() => {
    window.location = originalLocation;
    if (originalParentDescriptor) {
      Object.defineProperty(window, 'parent', originalParentDescriptor);
    }
    vi.unstubAllEnvs();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'parent', { value: window, configurable: true });
  });

  test('posts session to shell parent window without placing tokens in URLs when embedded', async () => {
    const postMessageMock = vi.fn();
    Object.defineProperty(window, 'parent', { value: { postMessage: postMessageMock }, configurable: true });
    const mockUser = { name: 'Test User', email: 'test@example.com', role: 'DOCENTE' };
    const mockToken = 'real_token_123';
    const mockAdaptedData = { user: mockUser, accessToken: mockToken, expiresIn: 900, tokenType: 'Bearer' };

    sessionModule.getLoginValidationError.mockReturnValue('');
    shellModule.loginWithApi.mockResolvedValueOnce({ token: mockToken });
    sessionModule.adaptSessionFromApi.mockReturnValue(mockAdaptedData);

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('maria.lopez@email.com'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText('Ingresar a EduTrack'));

    await waitFor(() => {
      expect(postMessageMock).toHaveBeenCalledWith(
        {
          type: 'edutrack:session',
          session: {
            accessToken: mockToken,
            tokenType: 'Bearer',
            expiresIn: 900,
            user: mockUser
          }
        },
        'http://localhost:3000'
      );
    });
    expect(replaceMock).not.toHaveBeenCalled();
    expect(window.location.href).toBe('');
  });

  test('redirects to shell origin without URL token hash when opened standalone', async () => {
    const mockUser = { name: 'Test User', email: 'test@example.com', role: 'ACUDIENTE' };
    const mockAdaptedData = { user: mockUser, accessToken: 'real_token_123', expiresIn: 900, tokenType: 'Bearer' };

    sessionModule.getLoginValidationError.mockReturnValue('');
    shellModule.loginWithApi.mockResolvedValueOnce({ dummy: 'data' });
    sessionModule.adaptSessionFromApi.mockReturnValue(mockAdaptedData);

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('maria.lopez@email.com'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText('Ingresar a EduTrack'));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('http://localhost:3000');
    });
    expect(screen.queryByText(/Demo/i)).not.toBeInTheDocument();
  });

  test('shows error message in DOM on failed login without demo bypass button', async () => {
    sessionModule.getLoginValidationError.mockReturnValue('');
    shellModule.loginWithApi.mockRejectedValueOnce(new Error('Auth failed'));

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('maria.lopez@email.com'), { target: { value: 'bad@email.com' } });
    fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByText('Ingresar a EduTrack'));

    await waitFor(() => {
      expect(screen.getByText('Auth failed')).toBeInTheDocument();
    });
    expect(screen.queryByText(/demostración/i)).not.toBeInTheDocument();
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
