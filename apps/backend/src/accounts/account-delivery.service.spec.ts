import { AccountDeliveryService } from './account-delivery.service';

describe('AccountDeliveryService', () => {
  it('sends an invitation token only in the URL fragment', async () => {
    const sendMail = jest.fn().mockResolvedValue({
      accepted: ['player@example.com'],
    });
    const service = new AccountDeliveryService(
      {
        mode: 'smtp',
        publicBaseUrl: 'https://coach.example.com',
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        timeoutMs: 10_000,
        from: 'no-reply@example.com',
      },
      { sendMail },
    );

    await service.deliverInvitation('player@example.com', 'raw-token');

    const message = sendMail.mock.calls[0][0];
    expect(message.to).toBe('player@example.com');
    expect(message.text).toContain(
      'https://coach.example.com/accept-invitation#token=raw-token',
    );
    expect(message.html).toContain(
      'https://coach.example.com/accept-invitation#token=raw-token',
    );
    expect(message.subject).not.toContain('raw-token');
  });

  it('rejects an SMTP response that did not accept a recipient', async () => {
    const service = new AccountDeliveryService(
      {
        mode: 'smtp',
        publicBaseUrl: 'http://localhost:3001',
        host: 'localhost',
        port: 1025,
        secure: false,
        timeoutMs: 10_000,
        from: 'no-reply@example.test',
      },
      { sendMail: jest.fn().mockResolvedValue({ accepted: [] }) },
    );

    await expect(
      service.deliverPasswordReset('player@example.test', 'raw-token'),
    ).rejects.toThrow('recipient was rejected');
  });
});
