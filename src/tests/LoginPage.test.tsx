import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { useAuth } from '../hooks/useAuth';
import { describe, it, expect, vi } from 'vitest';

// Mock the useAuth hook
vi.mock('../hooks/useAuth');

describe('LoginPage', () => {
  it('should call the signIn function on form submission', async () => {
    const mockSignIn = vi.fn();

    // Provide a mock implementation for the useAuth hook
    (useAuth as vi.Mock).mockReturnValue({
      signIn: mockSignIn,
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    // Simulate user input
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');

    // Simulate form submission
    await act(async () => {
        await userEvent.click(loginButton);
    });

    // Assert that the signIn function was called with the correct credentials
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
