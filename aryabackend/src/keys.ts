import {BindingKey} from '@loopback/core';
import {EmailManager} from './services/email.service';

export namespace EmailManagerBindings {
  export const SEND_MAIL = BindingKey.create<EmailManager>(
    'services.email.send',
  );
}
