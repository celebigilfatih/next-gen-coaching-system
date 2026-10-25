import { Inject, Injectable } from '@nestjs/common';
import type { AccountDeliveryConfig } from './account-delivery.config';
import {
  ACCOUNT_DELIVERY_CONFIG,
  ACCOUNT_MAIL_TRANSPORT,
} from './account-delivery.config';

export type AccountMailTransport = {
  sendMail(message: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<{ accepted?: Array<string | Buffer> }>;
};

@Injectable()
export class AccountDeliveryService {
  constructor(
    @Inject(ACCOUNT_DELIVERY_CONFIG)
    private readonly config: AccountDeliveryConfig,
    @Inject(ACCOUNT_MAIL_TRANSPORT)
    private readonly transport: AccountMailTransport | null,
  ) {}

  get mode() {
    return this.config.mode;
  }

  deliverInvitation(email: string, rawToken: string) {
    return this.deliver(
      email,
      'NGCS hesap davetiniz',
      'Hesabınızı oluşturmak için bağlantıyı açın.',
      'accept-invitation',
      rawToken,
    );
  }

  deliverPasswordReset(email: string, rawToken: string) {
    return this.deliver(
      email,
      'NGCS parola yenileme bağlantınız',
      'Parolanızı yenilemek için bağlantıyı açın.',
      'reset-password',
      rawToken,
    );
  }

  private async deliver(
    email: string,
    subject: string,
    introduction: string,
    path: string,
    rawToken: string,
  ) {
    if (this.config.mode !== 'smtp' || !this.transport) {
      throw new Error('SMTP delivery is not configured');
    }
    const link = new URL(path, `${this.config.publicBaseUrl}/`);
    link.hash = new URLSearchParams({ token: rawToken }).toString();
    const result = await this.transport.sendMail({
      from: this.config.from,
      to: email,
      subject,
      text: `${introduction}\n\n${link.toString()}\n\nBu bağlantı tek kullanımlıktır.`,
      html: `<p>${introduction}</p><p><a href="${link.toString()}">Güvenli bağlantıyı aç</a></p><p>Bu bağlantı tek kullanımlıktır.</p>`,
    });
    if (!result.accepted?.length)
      throw new Error('SMTP recipient was rejected');
  }
}
